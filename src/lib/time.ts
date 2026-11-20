export function formatWhen(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const delta = Math.max(0, now - then);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < minute) return 'Just now';
  if (delta < hour) {
    const minutes = Math.floor(delta / minute);
    return minutes === 1 ? '1 min ago' : `${minutes} min ago`;
  }
  if (delta < day) {
    const hours = Math.floor(delta / hour);
    return hours === 1 ? '1 hr ago' : `${hours} hr ago`;
  }
  if (delta < 7 * day) {
    const days = Math.floor(delta / day);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  return new Date(then).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
