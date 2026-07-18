/**
 * Maps a 0–100 school quality index to a letter grade.
 * Thresholds: 80+ → A tier, 60+ → B tier, 40+ → C tier, below 40 → D.
 */
export function numericIndexToLetterGrade(index) {
  const value = Math.round(Number(index));
  if (!Number.isFinite(value)) return null;

  const n = Math.min(100, Math.max(0, value));
  if (n >= 93) return "A+";
  if (n >= 88) return "A";
  if (n >= 80) return "A-";
  if (n >= 75) return "B+";
  if (n >= 70) return "B";
  if (n >= 65) return "B-";
  if (n >= 60) return "C+";
  if (n >= 55) return "C";
  if (n >= 50) return "C-";
  if (n >= 40) return "D+";
  return "D";
}

const LETTER_GRADE_PATTERN = /^[A-F][+-]?$/i;

function isLetterGrade(value) {
  return typeof value === "string" && LETTER_GRADE_PATTERN.test(value.trim());
}

function averageSchoolScores(schoolsList) {
  if (!schoolsList) return null;
  const scores = [
    schoolsList.elementary?.score,
    schoolsList.middle?.score,
    schoolsList.high?.score,
  ]
    .map(Number)
    .filter((n) => Number.isFinite(n));
  if (scores.length === 0) return null;
  return scores.reduce((sum, n) => sum + n, 0) / scores.length;
}

/**
 * Resolves the display letter grade for a schools payload from the API.
 * Prefers an explicit grade string, then meter (0–100), then average /10 scores.
 */
export function resolveSchoolGrade(schools) {
  if (!schools) return "—";

  if (isLetterGrade(schools.score)) {
    return schools.score.trim().toUpperCase();
  }

  if (isLetterGrade(schools.tier)) {
    return schools.tier.trim().toUpperCase();
  }

  if (Number.isFinite(schools.meter)) {
    const fromMeter = numericIndexToLetterGrade(schools.meter);
    if (fromMeter) return fromMeter;
  }

  const numericScore = Number(schools.score);
  if (Number.isFinite(numericScore)) {
    const index = numericScore <= 10 ? numericScore * 10 : numericScore;
    const fromScore = numericIndexToLetterGrade(index);
    if (fromScore) return fromScore;
  }

  const avgOutOf10 = averageSchoolScores(schools.schoolsList);
  if (avgOutOf10 != null) {
    const fromAvg = numericIndexToLetterGrade(avgOutOf10 * 10);
    if (fromAvg) return fromAvg;
  }

  return "C+";
}

/**
 * Deterministic 6–10 score when ATTOM returns no institutional rating,
 * seeded by school name so each campus differs but stays stable per search.
 */
export function deterministicSchoolScore(seed) {
  const text = String(seed || "school").toLowerCase();
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return 6 + (hash % 5);
}
