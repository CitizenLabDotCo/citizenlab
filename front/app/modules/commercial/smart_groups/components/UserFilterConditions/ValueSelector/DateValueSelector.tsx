import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

import React, { useEffect } from 'react';
import moment, { Moment } from 'moment';

import { DateInput } from '@citizenlab/cl2-component-library';

type Props = {
  value: string;
  onChange: (string: string) => void;
};

const DateValueSelector = ({ value, onChange }: Props) => {
  useEffect(() => {
    if (!value) {
      onChange(moment().format('YYYY-MM-DD'));
    }
  }, [onChange, value]);

  const handleOnChange = (moment: Moment) => {
    onChange(moment.format('YYYY-MM-DD'));
  };

  return (
    <DateInput
      value={value ? moment(value) : null}
      onChange={handleOnChange}
      openOnLeft={true}
    />
  );
};

export default DateValueSelector;
