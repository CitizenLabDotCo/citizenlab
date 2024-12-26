import React, { useState, useEffect } from 'react';

import {
  Tooltip,
  Button,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';

import { TIMES } from './constants';
import { Hour, Minute } from './types';

const BUTTON_HEIGHT = 45;

interface Props {
  h: Hour;
  m: Minute;
  onChange: (h: Hour, m: Minute) => void;
}

const TimeInput = ({ h, m, onChange }: Props) => {
  const [visible, setVisible] = useState(false);

  const timeIndex = h * 4 + m / 15;

  useEffect(() => {
    if (!visible) return;
    const el = document.getElementById('scroll-thingy');
    if (!el) return;
    el.scrollTop = Math.max(timeIndex - 2, 0) * BUTTON_HEIGHT;
  }, [visible, timeIndex]);

  const handleButtonClick = (i: number) => {
    const time = TIMES[i];
    const [hour, minute] = time.split(':').map(Number);
    onChange(hour as Hour, minute as Minute);
  };

  return (
    <Tooltip
      placement="right"
      duration={[200, 0]}
      visible={visible}
      onClickOutside={() => setVisible(false)}
      content={
        <Box
          maxHeight={`${5 * BUTTON_HEIGHT}px`}
          overflowY="scroll"
          id="scroll-thingy"
        >
          {TIMES.map((time, i) => (
            <Button
              key={time}
              buttonStyle="text"
              aria-selected={i === timeIndex}
              tabIndex={i === timeIndex ? 0 : -1}
              bgColor={i === timeIndex ? colors.teal700 : 'white'}
              textColor={i === timeIndex ? 'white' : colors.black}
              bgHoverColor={i === timeIndex ? colors.teal700 : colors.teal100}
              onClick={() => handleButtonClick(i)}
            >
              {time}
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
        {TIMES[timeIndex]}
      </Button>
    </Tooltip>
  );
};

export default TimeInput;
