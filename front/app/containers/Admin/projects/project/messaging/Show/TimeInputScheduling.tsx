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

import { TIMES } from './utils';

const BUTTON_HEIGHT = 45;

interface Props {
  selectedTime: Date;
  onChange: (newDate: Date) => void;
  selectedDate?: Date;
}

const TimeInput = ({ selectedTime, onChange, selectedDate }: Props) => {
  const [visible, setVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const locale = useLocale();

  const h = selectedTime.getHours();
  const timeIndex = h;

  // This is necessary to be able to use the timeIndex
  // in the next useEffect block without making it
  // a dependency of the useEffect.
  const timeIndexRef = useRef(timeIndex);
  useLayoutEffect(() => {
    timeIndexRef.current = timeIndex;
  });

  // Check if selected date is today
  const isToday = selectedDate
    ? new Date(selectedDate).toDateString() === new Date().toDateString()
    : false;

  // Filter times based on whether it's today
  const availableTimes = isToday
    ? TIMES.filter((time) => {
        const now = new Date();
        const currentHour = now.getHours();
        const timeHour = time.getHours();
        return timeHour > currentHour;
      })
    : TIMES;

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
            const originalIndex = TIMES.indexOf(time);
            const isSelected = originalIndex === timeIndex;

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
