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
}

const TimeInput = ({ selectedTime, onChange }: Props) => {
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

  // Make sure the selected time is centered inside
  // of the scroll container
  useEffect(() => {
    if (!visible) return;
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop =
      Math.max(timeIndexRef.current - 2, 0) * BUTTON_HEIGHT;
  }, [visible]);

  const handleButtonClick = (i: number) => {
    const time = TIMES[i];
    const hour = time.getHours();
    const minute = time.getMinutes();

    const newDate = new Date(selectedTime);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    onChange(newDate);
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
          {TIMES.map((time, i) => (
            <Button
              key={i}
              buttonStyle="text"
              aria-selected={i === timeIndex}
              tabIndex={i === timeIndex ? 0 : -1}
              bgColor={i === timeIndex ? colors.teal700 : 'white'}
              textColor={i === timeIndex ? 'white' : colors.black}
              bgHoverColor={i === timeIndex ? colors.teal700 : colors.teal100}
              onClick={() => handleButtonClick(i)}
            >
              {format(time, 'p', { locale: getLocale(locale) })}
            </Button>
          ))}
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
