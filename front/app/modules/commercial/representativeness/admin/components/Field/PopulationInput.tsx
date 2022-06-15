import React from 'react';

// components
import { Text, Input } from '@citizenlab/cl2-component-library';

// utils
import { parsePopulationValue } from './utils';

interface Props {
  value?: number;
  onChange: (value?: number) => void;
}

const PopulationInput = ({ value, onChange }: Props) => {
  const handleChange = (stringValue: string) => {
    const newValue = parsePopulationValue(stringValue);

    if (newValue !== null) {
      onChange(newValue);
    }
  };

  const formattedValue =
    value === undefined ? '' : value.toLocaleString('en-US');

  return (
    <>
      <Input type="text" value={formattedValue} onChange={handleChange} />
      <Text ml="16px" mr="24px" color="adminTextColor">
        50%
      </Text>
    </>
  );
};

export default PopulationInput;
