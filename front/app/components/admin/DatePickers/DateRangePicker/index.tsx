import React, { useState } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';

import ClickOutsideContainer from '../_shared/ClickOutsideContainer';

import Calendar from './Calendar';
import Input from './Input';
import { Props, SelectionMode } from './typings';

const DateRangePicker = ({
  selectedRange,
  startMonth,
  endMonth,
  defaultMonth,
  disabled,
  numberOfMonths,
  onUpdateRange,
}: Props) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>();

  const width = numberOfMonths === 1 ? '310px' : '620px';

  return (
    <ClickOutsideContainer
      width={width}
      onClickOutside={() => {
        setSelectionMode(undefined);
      }}
    >
      <Tooltip
        content={
          <Box width={width}>
            <Calendar
              selectedRange={selectedRange}
              startMonth={startMonth}
              endMonth={endMonth}
              defaultMonth={defaultMonth}
              disabled={disabled}
              selectionMode={selectionMode}
              numberOfMonths={numberOfMonths}
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
            selectionMode === 'from'
              ? setSelectionMode(undefined)
              : setSelectionMode('from');
          }}
          onClickTo={() => {
            selectionMode === 'to'
              ? setSelectionMode(undefined)
              : setSelectionMode('to');
          }}
        />
      </Tooltip>
    </ClickOutsideContainer>
  );
};

export default DateRangePicker;
