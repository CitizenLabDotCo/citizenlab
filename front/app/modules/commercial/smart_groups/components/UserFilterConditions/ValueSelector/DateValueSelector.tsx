import React, { useEffect } from 'react';
import { DateInput } from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';

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
