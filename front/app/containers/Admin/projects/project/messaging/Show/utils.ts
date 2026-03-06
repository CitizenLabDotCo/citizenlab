// Get timezone offset for the given timezone to display in the UI
export const getTimezoneOffset = (
  timeZone: string | undefined
): string | undefined => {
  if (!timeZone) return undefined;
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  });

  const parts = formatter.formatToParts(now);
  const timeZonePart = parts.find((part) => part.type === 'timeZoneName');

  return timeZonePart?.value;
};

// Set default time to 7:00 AM in time selector
export const getDefaultTime = () => {
  const date = new Date();
  date.setHours(7, 0, 0, 0);
  return date;
};
