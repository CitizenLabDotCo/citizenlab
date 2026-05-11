import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

import {
  Tooltip,
  Button,
  Box,
  colors,
  InputContainer,
  Icon,
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
      if (timeInMinutes < minInMinutes) return false;
    }

    if (maxTime) {
      const maxInMinutes = maxTime.getHours() * 60 + maxTime.getMinutes();
      if (timeInMinutes > maxInMinutes) return false;
    }

    return true;
  });

  // Index of the selected time within the *rendered* list, not the full TIMES
  // array. Using the TIMES index would land us past the end of availableTimes
  // whenever the list is filtered (today's slots, minTime/maxTime), and the
  // browser would clamp scrollTop to the bottom.
  const selectedIndex = availableTimes.findIndex(
    (time) => time.getHours() === h && time.getMinutes() === m
  );

  // Read inside the visibility effect via a ref so we don't re-scroll every
  // time the user picks a new time — only when the dropdown opens.
  const selectedIndexRef = useRef(selectedIndex);
  useLayoutEffect(() => {
    selectedIndexRef.current = selectedIndex;
  });

  // Make sure the selected time is centered inside
  // of the scroll container
  useEffect(() => {
    if (!visible) return;
    if (!scrollContainerRef.current) return;
    const idx = Math.max(selectedIndexRef.current, 0);
    scrollContainerRef.current.scrollTop = Math.max(idx - 2, 0) * BUTTON_HEIGHT;
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
                // Prevent focus from leaving the time input's trigger button
                // when a slot is clicked. Otherwise the button briefly takes
                // focus, then unmounts as the tooltip closes, and the modal's
                // focus trap recovers by jumping focus to the date picker.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleButtonClick(time)}
              >
                {format(time, 'p', { locale: getLocale(locale) })}
              </Button>
            );
          })}
        </Box>
      }
    >
      <InputContainer onClick={() => setVisible(true)}>
        <Box mr="8px">
          {format(selectedTime, 'p', { locale: getLocale(locale) })}
        </Box>
        <Icon name="clock" height="18px" />
      </InputContainer>
    </Tooltip>
  );
};

export default TimeInput;
