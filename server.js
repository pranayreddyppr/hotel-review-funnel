require("dotenv").config();
const config = require("./config");
const QRCode = require("qrcode");
const crypto = require("crypto");
const {
  saveRating,
  saveFullReview,
  isDuplicateReview,
  saveFeedback,
  getReviews,
  deleteReview,
  clearReviews,
  getStats,
} = require("./database");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

// Trust Render's reverse proxy so rate limiting uses the real client IP
app.set("trust proxy", 1);

// Security headers (CSP disabled — pages use inline scripts)
app.use(helmet({ contentSecurityPolicy: false }));

// HTTP request logging
app.use(morgan("combined"));

// ─────────────────────────────────────────────
// Rate limiters
// ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many requests. Please try again later." },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please try again later." },
});

// Block direct URL access to admin.html / login.html — use /admin and /login routes
app.get("/admin.html", (req, res) => res.status(404).end());
app.get("/login.html", (req, res) => res.status(404).end());

// Serve static files (HTML, CSS) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Parse JSON request bodies
app.use(express.json());

// ─────────────────────────────────────────────
// Helper: look up hotel config by slug
// ─────────────────────────────────────────────
function getHotel(slug) {
  if (!slug || !config.hotels[slug]) return null;
  return config.hotels[slug];
}

// ─────────────────────────────────────────────
// Signed pending token — avoids saving to DB until feedback is submitted
// Payload: { h: hotelSlug, r: rating, room: roomNumber|null, ts: timestamp }
// ─────────────────────────────────────────────
function createPendingToken(hotelSlug, rating, roomNumber) {
  const payload = Buffer.from(JSON.stringify({
    h: hotelSlug, r: rating, room: roomNumber || null, ts: Date.now()
  })).toString('base64url');
  const secret = process.env.ADMIN_PASS || 'fallback-dev-secret';
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `pending.${payload}.${sig}`;
}

function verifyPendingToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'pending') return null;
  const [, payload, sig] = parts;
  const secret = process.env.ADMIN_PASS || 'fallback-dev-secret';
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() - data.ts > 4 * 60 * 60 * 1000) return null; // 4-hour expiry
    return data;
  } catch { return null; }
}

// Validate room number: must be 101-130 or 201-230
function isValidRoom(room) {
  if (!room) return false;
  const n = parseInt(room, 10);
  return (n >= 101 && n <= 130) || (n >= 201 && n <= 230);
}

// ─────────────────────────────────────────────
// Basic Auth middleware for admin routes
// ─────────────────────────────────────────────
function basicAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const isApi = req.path.startsWith("/api/");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    if (!isApi) res.set("WWW-Authenticate", 'Basic realm="Admin"');
    return res.status(401).json({ error: "Authentication required." });
  }
  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  const colonIdx = decoded.indexOf(":");
  const user = decoded.slice(0, colonIdx);
  const pass = decoded.slice(colonIdx + 1);
  if (user !== process.env.ADMIN_USER) {
    if (!isApi) res.set("WWW-Authenticate", 'Basic realm="Admin"');
    return res
      .status(401)
      .json({ error: "Invalid credentials.", code: "wrong_user" });
  }
  if (pass !== process.env.ADMIN_PASS) {
    if (!isApi) res.set("WWW-Authenticate", 'Basic realm="Admin"');
    return res
      .status(401)
      .json({ error: "Invalid credentials.", code: "wrong_pass" });
  }
  next();
}

// ─────────────────────────────────────────────
// GET /api/config?hotel=slug
// Returns the hotel name so the front-end can display it.
// ─────────────────────────────────────────────
app.get("/api/config", (req, res) => {
  const hotel = getHotel(req.query.hotel);
  if (!hotel) {
    return res
      .status(404)
      .json({ error: "Hotel not found. Please check your link." });
  }
  res.json({
    hotelName: hotel.name,
    hotelLogo: hotel.logo || null,
    theme: hotel.theme || null,
    thankYouMessage: hotel.thankYouMessage || null,
  });
});

// ─────────────────────────────────────────────
// POST /api/rate
// Body: { rating, hotelSlug, roomNumber }
// HIGH ratings: save to DB immediately, redirect to Google.
// LOW ratings:  return a signed pending token (nothing saved to DB yet).
// ─────────────────────────────────────────────
app.post("/api/rate", apiLimiter, async (req, res) => {
  const { rating, hotelSlug, roomNumber } = req.body;

  const hotel = getHotel(hotelSlug);
  if (!hotel) {
    return res.status(404).json({ error: "Hotel not found. Please check your link." });
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
  }

  // roomNumber must be valid or explicitly null (I don't know)
  const roomProvided = roomNumber !== null && roomNumber !== undefined && roomNumber !== '';
  if (roomProvided && !isValidRoom(roomNumber)) {
    return res.status(400).json({ error: "Invalid room number." });
  }
  const cleanRoom = roomProvided ? String(parseInt(roomNumber, 10)) : null;

  if (rating >= hotel.ratingThreshold) {
    // HIGH rating: redirect to Google immediately.
    // Save to DB in the background — never block the user on a DB write.
    saveRating(hotelSlug, rating, cleanRoom).catch((err) => {
      console.error("saveRating background error:", err);
    });
    return res.json({ action: "redirect", url: hotel.googleReviewUrl });
  } else {
    // LOW rating: don't save yet — return a signed token
    try {
      const reviewToken = createPendingToken(hotelSlug, rating, cleanRoom);
      return res.json({ action: "feedback", reviewToken });
    } catch (error) {
      console.error("POST /api/rate error:", error);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  }
});

// ─────────────────────────────────────────────
// POST /api/feedback
// Body: { reviewToken: <string>, feedback: <string> }
// For signed pending tokens: verify, check duplicate, save full record.
// ─────────────────────────────────────────────
app.post("/api/feedback", apiLimiter, async (req, res) => {
  const { reviewToken, feedback } = req.body;

  if (!reviewToken || typeof reviewToken !== "string" || reviewToken.trim().length === 0) {
    return res.status(400).json({ error: "Invalid review token." });
  }

  if (!feedback || typeof feedback !== "string" || feedback.trim().length === 0) {
    return res.status(400).json({ error: "Feedback cannot be empty." });
  }

  const cleanFeedback = feedback.trim().slice(0, 500);
  const token = reviewToken.trim();

  try {
    // Signed pending token path (low ratings)
    if (token.startsWith('pending.')) {
      const payload = verifyPendingToken(token);
      if (!payload) {
        return res.status(400).json({ error: "Session expired. Please go back and try again." });
      }
      // Duplicate check: same room + hotel in last 24h
      const dup = await isDuplicateReview(payload.h, payload.room);
      if (dup) {
        return res.status(409).json({ error: "A review from this room was already submitted today. Thank you!" });
      }
      await saveFullReview(payload.h, payload.r, payload.room, cleanFeedback);
      return res.json({ success: true });
    }

    // Legacy UUID token path (high ratings that somehow reach feedback — shouldn't happen)
    const saved = await saveFeedback(token, cleanFeedback);
    if (!saved) {
      return res.status(400).json({ error: "Review not found or feedback already submitted." });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─────────────────────────────────────────────
// GET /login — standalone login page
// ─────────────────────────────────────────────
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ─────────────────────────────────────────────
// GET /admin — dashboard (auth handled client-side via sessionStorage)
// All data API endpoints below still enforce basicAuth server-side.
// ─────────────────────────────────────────────
app.get("/admin", adminLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ─────────────────────────────────────────────
// GET /api/admin/config — hotel list for the dashboard
// ─────────────────────────────────────────────
app.get("/api/admin/config", adminLimiter, basicAuth, async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  try {
    const hotels = await Promise.all(
      Object.entries(config.hotels).map(async ([slug, h]) => {
        const guestUrl = `${baseUrl}/?hotel=${slug}`;
        const qrDataUrl = await QRCode.toDataURL(guestUrl, {
          width: 200,
          margin: 1,
          color: { dark: "#0d1117", light: "#ffffff" },
        });
        return {
          slug,
          name: h.name,
          logo: h.logo || null,
          thankYouMessage: h.thankYouMessage || null,
          guestUrl,
          qrDataUrl,
        };
      })
    );
    res.json({ hotels });
  } catch (err) {
    console.error("GET /api/admin/config error:", err);
    res.status(500).json({ error: "Failed to generate QR codes." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/reviews?hotel=slug&page=1&rating=&search=
// ─────────────────────────────────────────────
app.get("/api/admin/reviews", adminLimiter, basicAuth, async (req, res) => {
  const hotelSlug = req.query.hotel || null;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const ratingFilter = req.query.rating ? parseInt(req.query.rating) : null;
  const search = req.query.search || null;
  try {
    const result = await getReviews(hotelSlug, page, 50, ratingFilter, search);
    res.json(result);
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/admin/reviews/:id — delete one review
// ─────────────────────────────────────────────
app.delete(
  "/api/admin/reviews/:id",
  adminLimiter,
  basicAuth,
  async (req, res) => {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid review ID." });
    }
    try {
      const deleted = await deleteReview(id);
      if (!deleted) return res.status(404).json({ error: "Review not found." });
      res.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/admin/reviews/:id error:", error);
      return res.status(500).json({ error: "Something went wrong." });
    }
  },
);

// ─────────────────────────────────────────────
// DELETE /api/admin/reviews?hotel=slug — clear all for a hotel
// ─────────────────────────────────────────────
app.delete("/api/admin/reviews", adminLimiter, basicAuth, async (req, res) => {
  const hotelSlug = req.query.hotel;
  if (!hotelSlug || !getHotel(hotelSlug)) {
    return res.status(400).json({ error: "Valid hotel slug required." });
  }
  try {
    const count = await clearReviews(hotelSlug);
    res.json({ success: true, deleted: count });
  } catch (error) {
    console.error("DELETE /api/admin/reviews error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/export?hotel=slug — CSV export
// ─────────────────────────────────────────────
app.get("/api/admin/export", adminLimiter, basicAuth, async (req, res) => {
  const hotelSlug = req.query.hotel || null;
  try {
    const result = await getReviews(hotelSlug, 1, 10000);
    const rows = result.reviews;
    const header = "Date,Hotel,Rating,Feedback\n";
    const csvRows = rows.map(function (r) {
      const date = r.created_at || "";
      const hotel = (r.hotel_slug || "").replace(/"/g, '""');
      const rating = r.rating;
      const feedback = (r.feedback || "")
        .replace(/"/g, '""')
        .replace(/\n/g, " ");
      return `"${date}","${hotel}",${rating},"${feedback}"`;
    });
    const csv = header + csvRows.join("\n");
    const today = new Date().toISOString().slice(0, 10);
    const filename = hotelSlug
      ? `${hotelSlug}-reviews-${today}.csv`
      : `reviews-all-${today}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error("GET /api/admin/export error:", error);
    return res.status(500).json({ error: "Export failed." });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/stats?hotel=slug — aggregate stats for analytics
// ─────────────────────────────────────────────
app.get("/api/admin/stats", adminLimiter, basicAuth, async (req, res) => {
  const hotelSlug = req.query.hotel || null;
  if (hotelSlug && !getHotel(hotelSlug)) {
    return res.status(404).json({ error: "Hotel not found." });
  }
  try {
    const stats = await getStats(hotelSlug);
    res.json(stats);
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// ─────────────────────────────────────────────
// Start the server
// ─────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
