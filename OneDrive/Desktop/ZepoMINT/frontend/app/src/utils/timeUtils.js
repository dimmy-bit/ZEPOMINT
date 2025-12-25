/**
 * Formats a timestamp into a human-readable time remaining string
 * @param {number} endTime - The end time in milliseconds
 * @returns {string} - Formatted time remaining
 */
export function formatTimeRemaining(endTime) {
  const now = Date.now();
  const diff = endTime - now;
  
  if (diff <= 0) {
    return 'Auction Ended';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Formats a timestamp into a readable date string
 * @param {number} timestamp - The timestamp in seconds
 * @returns {string} - Formatted date string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}