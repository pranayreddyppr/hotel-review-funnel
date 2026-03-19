// Load our config settings (hotel name, Google URL, port, threshold)
const config = require('./config');

// Load our database helper functions (saveRating, saveFeedback)
const { saveRating, saveFeedback } = require('./database');

// Load Express — this is the framework that handles web requests
const express = require('express');
const app = express();

// Serve static files (HTML, CSS, JS) from the "public" folder.
// When a guest visits the site, Express looks in public/ for the files.
app.use(express.static('public'));

// Allow Express to read JSON data sent in request bodies (e.g., { rating: 4 })
app.use(express.json());

// ─────────────────────────────────────────────
// GET /api/config
// Returns the hotel name so the front-end can display it.
// We intentionally do NOT send the Google Review URL here —
// it's returned only after a rating is submitted, to prevent misuse.
// ─────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({ hotelName: config.hotelName });
});

// ─────────────────────────────────────────────
// POST /api/rate
// Called when a guest clicks a star rating.
// Body: { rating: <number 1-5> }
// ─────────────────────────────────────────────
app.post('/api/rate', (req, res) => {
  const { rating } = req.body;

  // Validate: rating must be a number between 1 and 5
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }

  // Save the rating to the database and get back the new row's id
  const reviewId = saveRating(rating);

  // Decide what to do based on the rating threshold from config.js
  if (rating >= config.ratingThreshold) {
    // High rating — send them to Google Reviews
    return res.json({ action: 'redirect', url: config.googleReviewUrl });
  } else {
    // Low rating — show them the private feedback form
    return res.json({ action: 'feedback', reviewId });
  }
});

// ─────────────────────────────────────────────
// POST /api/feedback
// Called when a guest submits private text feedback.
// Body: { reviewId: <number>, feedback: <string> }
// ─────────────────────────────────────────────
app.post('/api/feedback', (req, res) => {
  const { reviewId, feedback } = req.body;

  // Validate: reviewId must exist and be a number
  if (!reviewId || typeof reviewId !== 'number') {
    return res.status(400).json({ error: 'Invalid review ID.' });
  }

  // Validate: feedback must exist, not be blank, and not exceed 2000 characters
  if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
    return res.status(400).json({ error: 'Feedback cannot be empty.' });
  }

  // Trim whitespace and cap at 2000 characters for safety
  const cleanFeedback = feedback.trim().slice(0, 2000);

  // Save the feedback text to the database
  saveFeedback(reviewId, cleanFeedback);

  // Let the front-end know it worked
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// Start the server
// It listens on the port defined in config.js (default: 3000)
// ─────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
