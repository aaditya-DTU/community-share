/**
 * Calculate a user's trust score (0–100) using a weighted formula.
 *
 * Factors:
 *  - Average review rating    (50% weight) — quality signal
 *  - Total successful lends   (25% weight) — owner reliability
 *  - Total successful borrows (25% weight) — borrower reliability
 *
 * The score is clamped to [0, 100] and rounded to 1 decimal place.
 *
 * @param {Object} user
 * @param {number} user.totalBorrows   - Completed borrow cycles
 * @param {number} user.totalLends     - Completed lend cycles
 * @param {number} user.averageRating  - Average review rating (1–5), optional
 * @param {number} user.reviewCount    - Number of reviews received, optional
 * @returns {number} trust score 0–100
 */
const calculateTrustScore = (user) => {
  if (!user) return 0;

  const borrows      = Math.max(0, user.totalBorrows  || 0);
  const lends        = Math.max(0, user.totalLends    || 0);
  const avgRating    = Math.min(5, Math.max(0, user.averageRating || 0));
  const reviewCount  = Math.max(0, user.reviewCount   || 0);

  // Rating component — scale 1–5 rating to 0–50 points
  // Low review count dampens the impact (confidence factor)
  const confidenceFactor = reviewCount / (reviewCount + 3); // approaches 1 as reviews grow
  const ratingScore = avgRating > 0
    ? ((avgRating - 1) / 4) * 50 * confidenceFactor
    : 0;

  // Activity components — log scale so early borrows/lends matter most
  // 10 lends/borrows → ~25 pts each (max)
  const lendScore   = Math.min(25, Math.log1p(lends)   * 10);
  const borrowScore = Math.min(25, Math.log1p(borrows)  * 10);

  const raw = ratingScore + lendScore + borrowScore;

  return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
};

export default calculateTrustScore;
