// Load environment variables from the .env file (e.g., PORT=3000)
require('dotenv').config();

module.exports = {
  // The name of your hotel — change this for each hotel you set up
  hotelName: 'Best Western Butner Creedmoor Inn',

  // The link guests are sent to if they rate 3.5 stars or above.
  // Replace YOUR_PLACE_ID_HERE with your hotel's actual Google Place ID.
  // How to find it: https://developers.google.com/maps/documentation/places/web-service/place-id-finder
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ3__6HjgBrYkRGmKkDRsbWvA',

  // Guests who rate AT OR ABOVE this number go to Google Reviews.
  // Guests who rate BELOW this number see the private feedback form.
  // 3.5 is the default — you can change it to 4 or any number between 1 and 5.
  ratingThreshold: 3.5,

  // The port number the server runs on.
  // It reads from your .env file first (process.env.PORT),
  // and falls back to 3000 if nothing is set.
  port: process.env.PORT || 3000,
};
