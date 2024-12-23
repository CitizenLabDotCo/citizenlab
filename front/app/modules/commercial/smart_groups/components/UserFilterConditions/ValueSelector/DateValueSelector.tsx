import React from 'react';

import { format, startOfDay } from 'date-fns';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';

type Props = {
  value?: string;
  onChange: (dateStr: string) => void;
};

const DateValueSelector = ({ value, onChange }: Props) => {
  const handleOnChange = (date: Date | null) => {
    if (date) {
      onChange(format(startOfDay(date), 'yyyy-MM-dd'));
    }
  };

  return (
    <DateSinglePicker
      selectedDate={typeof value === 'string' ? new Date(value) : undefined}
      onChange={handleOnChange}
    />
  );
};

export default DateValueSelector;
