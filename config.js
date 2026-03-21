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
      theme: {
        slug: "econo-lodge",
        accent: "#0057A0",
        accentLight: "rgba(0,87,160,0.12)",
        accentGlow: "rgba(0,87,160,0.35)",
        gradient: "linear-gradient(145deg, #04132a 0%, #0b1e3d 45%, #0a1a30 100%)",
        starColor: "#4DA8DA",
        starGlow: "rgba(77,168,218,0.55)",
        btnGradient: "linear-gradient(135deg, #0057A0 0%, #4DA8DA 50%, #0057A0 100%)",
        btnText: "#ffffff",
        dividerColor: "rgba(77,168,218,0.6)",
        cardBorder: "rgba(77,168,218,0.12)",
        cardAccent: "rgba(0,87,160,0.15)",
      },
    },
    "best-western": {
      name: "Best Western Butner Creedmoor Inn",
      logo: "BW Master Brand Logo_RGB.png",
      googleReviewUrl:
        "https://search.google.com/local/writereview?placeid=ChIJ3__6HjgBrYkRGmKkDRsbWvA",
      ratingThreshold: 3.5,
      theme: {
        slug: "best-western",
        accent: "#C8102E",
        accentLight: "rgba(200,16,46,0.12)",
        accentGlow: "rgba(200,16,46,0.35)",
        gradient: "linear-gradient(145deg, #1a0a0a 0%, #2a0e14 45%, #1a0e10 100%)",
        starColor: "#D4AF37",
        starGlow: "rgba(212,175,55,0.55)",
        btnGradient: "linear-gradient(135deg, #C8102E 0%, #e8334e 50%, #C8102E 100%)",
        btnText: "#ffffff",
        dividerColor: "rgba(212,175,55,0.6)",
        cardBorder: "rgba(212,175,55,0.12)",
        cardAccent: "rgba(200,16,46,0.15)",
      },
    },
  },
  port: process.env.PORT || 3000,
};
