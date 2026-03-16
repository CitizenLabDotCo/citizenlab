// Set default time to 7:00 AM in time selector
export const getDefaultTime = (): Date => {
  const now = new Date();
  now.setHours(now.getHours() + 1, 0, 0, 0);
  return now;
};

// if selected date is today, set time to next hour in tenant timezone
export const getNextHourTime = (currentTime: Date): Date => {
  const nextHour = currentTime.getHours() + 1;
  const newTime = new Date();
  newTime.setHours(nextHour, 0, 0, 0);
  return newTime;
};
