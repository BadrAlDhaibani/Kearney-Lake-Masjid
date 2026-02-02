/**
 * Parses a time string (HH:MM:SS or HH:MM) to total minutes since midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

/**
 * Formats a time string (HH:MM:SS or HH:MM) to 12-hour format with AM/PM.
 * Example: "13:30:00" -> "1:30 PM"
 */
export function formatTime12Hour(timeStr: string): string {
  const parts = timeStr.split(':').map(Number);
  const hours24 = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, '0');

  return `${hours12}:${paddedMinutes} ${period}`;
}

/**
 * Formats a timestamp for announcement display.
 * Recent (< 7 days): "2 hours ago", "3 days ago"
 * Older: "Jan 15, 2024"
 */
export function formatAnnouncementDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }

  // For older announcements, use absolute date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Truncates text to a specified length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
