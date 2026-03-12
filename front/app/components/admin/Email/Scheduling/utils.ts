import moment from 'moment-timezone';

// Set default time to 7:00 AM in time selector
export const getDefaultTime = (): Date => {
  const now = new Date();
  now.setHours(now.getHours() + 1, 0, 0, 0);
  return now;
};

// Combine selected date and time and convert to ISO string in tenant timezone
export const datetimeInTimezone = (
  date: Date,
  time: Date,
  timeZone: string
): string => {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return moment.tz(combined, timeZone).utc().toISOString();
};
// Check if selected date is the same as tenant's current date in tenant timezone
export const isSameDay = (selectedDate: Date, tenantTimeNow: Date): boolean => {
  const date = new Date(selectedDate);
  date.setHours(0, 0, 0, 0);
  const tenantDate = new Date(tenantTimeNow);
  tenantDate.setHours(0, 0, 0, 0);
  return date.getTime() === tenantDate.getTime();
};

// if selected date is today, set time to next hour in tenant timezone
export const getNextHourTime = (currentTime: Date): Date => {
  const nextHour = currentTime.getHours() + 1;
  const newTime = new Date();
  newTime.setHours(nextHour, 0, 0, 0);
  return newTime;
};
