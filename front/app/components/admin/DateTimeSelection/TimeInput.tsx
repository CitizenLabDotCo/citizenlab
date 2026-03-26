import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

import {
  Tooltip,
  Button,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';

import useLocale from 'hooks/useLocale';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { TIMES } from './constants';

const BUTTON_HEIGHT = 45;

interface Props {
  selectedTime: Date;
  onChange: (newDate: Date) => void;
  selectedDate?: Date;
  currentTimeInTz?: Date;
  minTime?: Date;
  maxTime?: Date;
}

const TimeInput = ({
  selectedTime,
  onChange,
  selectedDate = undefined,
  currentTimeInTz = undefined,
  minTime,
  maxTime,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const locale = useLocale();

  const h = selectedTime.getHours();
  const m = selectedTime.getMinutes();

  // In theory the Math.floor should not be necessary,
  // but just in case we will floor it to avoid
  // getting a floating point value.
  const timeIndex = Math.floor(h * 4 + m / 15);

  // This is necessary to be able to use the timeIndex
  // in the next useEffect block without making it
  // a dependency of the useEffect.
  const timeIndexRef = useRef(timeIndex);
  useLayoutEffect(() => {
    timeIndexRef.current = timeIndex;
  });

  // Check if selected date is today - use tenant timezone if provided
  const referenceTime = currentTimeInTz || new Date();
  const isToday = selectedDate
    ? new Date(selectedDate).toDateString() === referenceTime.toDateString()
    : false;

  // Filter times based on whether it's today - use tenant timezone
  const availableTimes = TIMES.filter((time) => {
    const timeHour = time.getHours();
    const timeMinute = time.getMinutes();
    const timeInMinutes = timeHour * 60 + timeMinute;

    if (isToday) {
      const currentHour = referenceTime.getHours();
      if (timeHour <= currentHour) return false;
    }

    if (minTime) {
      const minInMinutes = minTime.getHours() * 60 + minTime.getMinutes();
      if (timeInMinutes <= minInMinutes) return false;
    }

    if (maxTime) {
      const maxInMinutes = maxTime.getHours() * 60 + maxTime.getMinutes();
      if (timeInMinutes >= maxInMinutes) return false;
    }

    return true;
  });

  // Make sure the selected time is centered inside
  // of the scroll container
  useEffect(() => {
    if (!visible) return;
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop =
      Math.max(timeIndexRef.current - 2, 0) * BUTTON_HEIGHT;
  }, [visible]);

  const handleButtonClick = (time: Date) => {
    const hour = time.getHours();
    const minute = time.getMinutes();

    const newDate = new Date(selectedTime);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    onChange(newDate);
    setVisible(false);
  };

  return (
    <Tooltip
      placement="right"
      duration={[200, 0]}
      visible={visible}
      onClickOutside={() => setVisible(false)}
      onHidden={() => setVisible(false)}
      content={
        <Box
          ref={scrollContainerRef}
          maxHeight={`${5 * BUTTON_HEIGHT}px`}
          overflowY="scroll"
        >
          {availableTimes.map((time, i) => {
            const isSelected = time.getHours() === h && time.getMinutes() === m;
            return (
              <Button
                key={i}
                buttonStyle="text"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                bgColor={isSelected ? colors.teal700 : 'white'}
                textColor={isSelected ? 'white' : colors.black}
                bgHoverColor={isSelected ? colors.teal700 : colors.teal100}
                onClick={() => handleButtonClick(time)}
              >
                {format(time, 'p', { locale: getLocale(locale) })}
              </Button>
            );
          })}
        </Box>
      }
    >
      <Button
        buttonStyle="secondary-outlined"
        onClick={() => {
          setVisible(true);
        }}
        textColor={colors.black}
      >
        {format(selectedTime, 'p', { locale: getLocale(locale) })}
      </Button>
    </Tooltip>
  );
};

export default TimeInput;
