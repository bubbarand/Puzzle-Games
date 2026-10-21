// 3 stars at best score, 2 within 20 percent, 1 for any solve, 0 if not solved.
// best === null (unknown) gives 1 star for a solve.
export function stars(score, best, solved) {
  if (!solved) return 0;
  if (best == null || score <= 0) return 1;
  if (score <= best) return 3;
  return score <= best * 1.2 ? 2 : 1;
}
