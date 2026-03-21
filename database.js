const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// saveRating(hotelSlug, rating)
// Inserts a new review row with a random UUID token.
// Returns the token — used by the guest to submit feedback without exposing a guessable ID.
async function saveRating(hotelSlug, rating) {
  const token = crypto.randomUUID();
  const { data, error } = await supabase
    .from("reviews")
    .insert({ hotel_slug: hotelSlug, rating, token })
    .select("token")
    .single();
  if (error) throw error;
  return data.token;
}

// saveFeedback(token, feedback)
// Attaches feedback to the review identified by the unguessable token.
// .is('feedback', null) prevents overwriting feedback that was already submitted.
// Returns true if saved, false if token not found or feedback already exists.
async function saveFeedback(token, feedback) {
  const { data, error } = await supabase
    .from("reviews")
    .update({ feedback })
    .eq("token", token)
    .is("feedback", null)
    .select("id");
  if (error) throw error;
  return data && data.length > 0;
}

// getReviews(hotelSlug, page, limit, ratingFilter, search)
// Returns paginated reviews ordered by newest first.
// hotelSlug is optional — if null, returns reviews for all hotels.
async function getReviews(hotelSlug, page = 1, limit = 50, ratingFilter = null, search = null) {
  const offset = (page - 1) * limit;
  let query = supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (hotelSlug) {
    query = query.eq("hotel_slug", hotelSlug);
  }
  if (ratingFilter && Number.isInteger(ratingFilter) && ratingFilter >= 1 && ratingFilter <= 5) {
    query = query.eq("rating", ratingFilter);
  }
  if (search && search.trim().length > 0) {
    query = query.ilike("feedback", `%${search.trim()}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { reviews: data, total: count };
}

// deleteReview(id)
// Deletes a single review by its ID.
async function deleteReview(id) {
  const { data, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return data && data.length > 0;
}

// clearReviews(hotelSlug)
// Deletes all reviews for a given hotel.
async function clearReviews(hotelSlug) {
  const { data, error } = await supabase
    .from("reviews")
    .delete()
    .eq("hotel_slug", hotelSlug)
    .select("id");
  if (error) throw error;
  return data ? data.length : 0;
}

module.exports = { saveRating, saveFeedback, getReviews, deleteReview, clearReviews };
