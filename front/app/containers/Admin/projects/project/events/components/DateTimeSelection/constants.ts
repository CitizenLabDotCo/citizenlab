const generateTimes = () => {
  const times: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      const hourString = hour < 10 ? `0${hour}` : `${hour}`;
      const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;

      times.push(`${hourString}:${minuteString}`);
    }
  }
  return times;
};

export const TIMES = generateTimes();
