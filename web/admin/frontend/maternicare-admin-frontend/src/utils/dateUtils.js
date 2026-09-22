/**
 * Calculates the number of complete years of professional experience
 * from a given start date to today.
 *
 * @param {string|Date|null} startDate - ISO date string or Date object
 * @returns {number|null} - Number of complete years, or null if no date provided
 */
export const calculateYearsOfExperience = (startDate) => {
  if (!startDate) return null;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) {
    years--;
  }

  return Math.max(0, years);
};

/**
 * Formats a professional start date as a readable string.
 *
 * @param {string|Date|null} startDate
 * @returns {string}
 */
export const formatProfessionalStartDate = (startDate) => {
  if (!startDate) return 'Not provided';
  try {
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return 'Not provided';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Not provided';
  }
};

/**
 * Returns today's date as a yyyy-mm-dd string (max value for date inputs).
 */
export const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
