/**
 * Date utility helper for PINAKA FITNESS.
 * Handles current Date and Time calculations in Asia/Kolkata (IST).
 */

export function getISTDateTime() {
  const now = new Date();
  
  // Format Date: YYYY-MM-DD
  const dateStr = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  // Format Time: HH:MM:SS
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);

  return { dateStr, timeStr };
}
