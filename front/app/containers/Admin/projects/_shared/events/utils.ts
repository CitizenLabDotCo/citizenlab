import { roundToNearestMinutes, addMinutes } from 'date-fns';

export const initializeEventTimes = () => {
  const date = new Date();
  const roundedDate = roundToNearestMinutes(date, { nearestTo: 15 });

  return {
    start_at: roundedDate.toISOString(),
    end_at: addMinutes(roundedDate, 30).toISOString(),
  };
};
