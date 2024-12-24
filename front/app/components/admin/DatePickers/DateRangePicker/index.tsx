import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';

import ClickOutsideContainer from '../_shared/ClickOutsideContainer';

import Calendar from './Calendar';
import Input from './Input';
import { Props, SelectionMode } from './typings';

const WIDTH = '620px';

const DateRangePicker = ({
  selectedRange,
  startMonth,
  endMonth,
  defaultMonth,
  disabled,
  onUpdateRange,
}: Props) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>();

  return (
    <ClickOutsideContainer
      width={WIDTH}
      onClickOutside={() => {
        setSelectionMode(undefined);
      }}
    >
      <Tooltip
        content={
          <Box width={WIDTH}>
            <Calendar
              selectedRange={selectedRange}
              startMonth={startMonth}
              endMonth={endMonth}
              defaultMonth={defaultMonth}
              disabled={disabled}
              selectionMode={selectionMode}
              onUpdateRange={onUpdateRange}
              onUpdateSelectionMode={setSelectionMode}
            />
          </Box>
        }
        placement="bottom"
        visible={!!selectionMode}
        width="1200px"
      >
        <Input
          selectedRange={selectedRange}
          selectionMode={selectionMode}
          onClickFrom={() => {
            setSelectionMode('from');
          }}
          onClickTo={() => {
            setSelectionMode('to');
          }}
        />
      </Tooltip>
    </ClickOutsideContainer>
  );
};

export default DateRangePicker;
