import React, { useState } from 'react';

import Input from './Input';

type Props = {
  id?: string;
  selectedDate: Date | undefined;
  onChange: (date: Date) => void;
  disabled?: boolean;
};

const DateSinglePicker = ({ selectedDate }: Props) => {
  const [_calendarOpen, setCalendarOpen] = useState(false);

  return (
    <Input selectedDate={selectedDate} onClick={() => setCalendarOpen(true)} />
  );
};

export default DateSinglePicker;
