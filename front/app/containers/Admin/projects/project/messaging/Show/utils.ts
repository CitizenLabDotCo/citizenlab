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

// Disable past dates in the date picker to prevent scheduling campaigns in the past
export const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

// Generate times in 5 minute intervals for the time selector
export const generateTimes = () => {
  const times: Date[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const date = new Date();
      date.setHours(hour);
      date.setMinutes(minute);
      date.setSeconds(0);
      date.setMilliseconds(0);

      times.push(date);
    }
  }
  return times;
};

export const TIMES = generateTimes();
