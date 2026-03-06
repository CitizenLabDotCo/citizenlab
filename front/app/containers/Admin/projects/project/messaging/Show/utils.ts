// Set default time to 7:00 AM in time selector
export const getDefaultTime = () => {
  const date = new Date();
  date.setHours(7, 0, 0, 0);
  return date;
};
