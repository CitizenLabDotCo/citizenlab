import React, { useState } from 'react';

// components
import { Text, Input } from '@citizenlab/cl2-component-library';

// utils
import { parsePopulationValue } from './utils';

interface Props {
  value?: number;
}

const PopulationInput = ({ value }: Props) => {
  const [formattedValue, setFormattedValue] = useState(
    value === undefined ? '' : 'TODO'
  );

  const handleChange = (value: string) => {
    const { formattedValue: newFormattedValue } = parsePopulationValue(value);

    if (newFormattedValue !== null) {
      setFormattedValue(formattedValue);
    }
  };

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
