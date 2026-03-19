// Import the better-sqlite3 package so we can use a database
const Database = require('better-sqlite3');

// Open (or create) the database file called reviews.db
// This file will be created automatically in your project folder if it doesn't exist yet
const db = new Database('reviews.db');

// Create the "reviews" table if it doesn't already exist.
// This runs once when the server starts — it's safe to run every time.
// Each column stores a different piece of information:
//   id         — a unique number assigned automatically to each row
//   rating     — the star rating the guest chose (1 to 5)
//   feedback   — the private text feedback (only filled in for low ratings)
//   created_at — the date and time the review was submitted
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    rating     INTEGER NOT NULL,
    feedback   TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// saveRating(rating)
// Call this function when a guest submits a star rating.
// It saves a new row in the database with just the rating.
// Returns the id of the newly inserted row — we use this later to attach feedback.
function saveRating(rating) {
  // Prepare the SQL insert statement
  const stmt = db.prepare('INSERT INTO reviews (rating) VALUES (?)');

  // Run it with the rating value and get back info about what was inserted
  const result = stmt.run(rating);

  // Return the auto-generated id of the new row
  return result.lastInsertRowid;
}

// saveFeedback(id, feedback)
// Call this function when a guest submits private text feedback.
// It finds the row with the matching id and fills in the feedback column.
function saveFeedback(id, feedback) {
  // Prepare the SQL update statement
  const stmt = db.prepare('UPDATE reviews SET feedback = ? WHERE id = ?');

  // Run it with the feedback text and the row id
  stmt.run(feedback, id);
}

// Export the two functions so server.js can use them
module.exports = { saveRating, saveFeedback };
