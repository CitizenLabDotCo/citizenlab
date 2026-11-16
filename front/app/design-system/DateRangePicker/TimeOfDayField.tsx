import React, { ReactNode } from 'react';

import { Time } from '@internationalized/date';

import TimeField from '../TimeField';
import '../tokens.css';

export type TimeOfDay = {
  label: ReactNode;
  value: Time | null;
  minValue?: Time;
  maxValue?: Time;
  description?: ReactNode;
  isDisabled?: boolean;
  // Only complete times inside minValue and maxValue arrive here.
  onChange: (value: Time) => void;
};

const isInRange = (time: Time, minValue?: Time, maxValue?: Time) =>
  (!minValue || time.compare(minValue) >= 0) &&
  (!maxValue || time.compare(maxValue) <= 0);

type Props = {
  time: TimeOfDay;
};

// A start or end time under the calendar of a DayPressRangePicker.
const TimeOfDayField = ({ time }: Props) => (
  <TimeField
    label={time.label}
    description={time.description}
    size={32}
    value={time.value}
    minValue={time.minValue}
    maxValue={time.maxValue}
    isDisabled={time.isDisabled}
    onChange={(value) => {
      // Typing passes through times outside the limits; those stay unsaved.
      if (value && isInRange(value, time.minValue, time.maxValue)) {
        time.onChange(value);
      }
    }}
  />
);

export default TimeOfDayField;
