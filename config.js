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
        accent: "#0066B2",
        accentLight: "rgba(0,102,178,0.13)",
        accentGlow: "rgba(0,102,178,0.42)",
        gradient:
          "linear-gradient(145deg, #06101F 0%, #0C1E3D 45%, #071628 100%)",
        starColor: "#4AAFF5",
        starGlow: "rgba(74,175,245,0.62)",
        btnGradient:
          "linear-gradient(135deg, #004F9F 0%, #0066B2 55%, #007ED4 100%)",
        btnText: "#ffffff",
        dividerColor: "rgba(74,175,245,0.55)",
        cardBorder: "rgba(0,102,178,0.22)",
        cardAccent: "rgba(0,102,178,0.13)",
      },
    },
  },
  port: process.env.PORT || 3000,
};
