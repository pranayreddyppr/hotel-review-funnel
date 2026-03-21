// Each hotel is identified by a URL slug (e.g., ?hotel=econo-lodge).
// Add a new entry here for each hotel you onboard.
module.exports = {
  hotels: {
    "econo-lodge": {
      name: "Econo Lodge Creedmoor - Butner",
      logo: "Econo Lodge Logo.jpg",
      googleReviewUrl:
        "https://search.google.com/local/writereview?placeid=ChIJJ6GIUGwBrYkRjKwCJD4NEt0",
      ratingThreshold: 3.5,
      thankYouMessage:
        "Thank you for taking the time to share your feedback. Our team reviews every response and your comments help us improve your next stay.",
      theme: {
        slug: "econo-lodge",
        accent: "#0077C0",
        accentLight: "rgba(0,119,192,0.12)",
        accentGlow: "rgba(0,119,192,0.35)",
        gradient:
          "linear-gradient(145deg, #041E30 0%, #0B2E48 45%, #061A28 100%)",
        starColor: "#5BC0DE",
        starGlow: "rgba(91,192,222,0.55)",
        btnGradient:
          "linear-gradient(135deg, #005A9C 0%, #0077C0 50%, #005A9C 100%)",
        btnText: "#ffffff",
        dividerColor: "rgba(91,192,222,0.6)",
        cardBorder: "rgba(0,119,192,0.18)",
        cardAccent: "rgba(0,119,192,0.15)",
      },
    },
    "best-western": {
      name: "Best Western Butner Creedmoor Inn",
      logo: "BW Master Brand Logo_RGB.png",
      googleReviewUrl:
        "https://search.google.com/local/writereview?placeid=ChIJ3__6HjgBrYkRGmKkDRsbWvA",
      ratingThreshold: 3.5,
      thankYouMessage:
        "We sincerely appreciate your feedback. Your experience matters deeply to us, and we look forward to welcoming you back soon.",
      theme: {
        slug: "best-western",
        accent: "#C8102E",
        accentLight: "rgba(200,16,46,0.12)",
        accentGlow: "rgba(200,16,46,0.35)",
        gradient:
          "linear-gradient(145deg, #1A0A0A 0%, #2A0E14 45%, #1A0E10 100%)",
        starColor: "#D4AF37",
        starGlow: "rgba(212,175,55,0.55)",
        btnGradient:
          "linear-gradient(135deg, #C8102E 0%, #e03350 40%, #D4AF37 100%)",
        btnText: "#ffffff",
        dividerColor: "rgba(212,175,55,0.6)",
        cardBorder: "rgba(212,175,55,0.14)",
        cardAccent: "rgba(200,16,46,0.12)",
      },
    },
  },
  port: process.env.PORT || 3000,
};
