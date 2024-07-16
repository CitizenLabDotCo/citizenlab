import React from 'react';

import moment from 'moment';

import DateSinglePicker from 'components/admin/DateSinglePicker';

type Props = {
  value?: string;
  onChange: (dateStr: string) => void;
};

const DateValueSelector = ({ value, onChange }: Props) => {
  const handleOnChange = (date: Date | null) => {
    if (date) {
      onChange(moment(date).format('YYYY-MM-DD'));
    }
  };

  return (
    <DateSinglePicker
      selectedDate={typeof value === 'string' ? new Date(value) : null}
      onChange={handleOnChange}
    />
  );
};

export default DateValueSelector;
