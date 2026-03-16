const generateTimes = () => {
  const times: Date[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const date = new Date();
      date.setHours(hour);
      date.setMinutes(minutes);

      times.push(date);
    }
  }
  return times;
};

export const TIMES = generateTimes();
