import React from 'react';

import { DayPicker } from 'react-day-picker';

const TimelineCalendar = () => {
  return (
    <DayPicker
      mode="range"
      selected={{
        from: new Date(2021, 0, 1),
        to: new Date(2021, 0, 5),
      }}
    />
  );
};

export default TimelineCalendar;
