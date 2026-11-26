import React, { ReactNode, useState } from 'react';

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

const isSameTime = (a: Time | null, b: Time | null) =>
  a === b || (!!a && !!b && a.compare(b) === 0);

type Props = {
  time: TimeOfDay;
};

// A start or end time under the calendar of a DayPressRangePicker.
const TimeOfDayField = ({ time }: Props) => {
  // React Aria resets a controlled field whose value doesn't follow the typing,
  // so the field keeps what was typed (an out-of-range time then shows as
  // invalid instead of vanishing) until the caller sends a different time.
  const [typed, setTyped] = useState(time.value);
  const [savedValue, setSavedValue] = useState(time.value);

  if (!isSameTime(time.value, savedValue)) {
    setSavedValue(time.value);
    setTyped(time.value);
  }

  return (
    <TimeField
      label={time.label}
      description={time.description}
      size={32}
      value={typed}
      minValue={time.minValue}
      maxValue={time.maxValue}
      isDisabled={time.isDisabled}
      onChange={(value) => {
        setTyped(value);
        if (value && isInRange(value, time.minValue, time.maxValue)) {
          time.onChange(value);
        }
      }}
    />
  );
};

export default TimeOfDayField;
