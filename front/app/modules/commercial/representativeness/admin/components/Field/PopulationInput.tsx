import React, { useState } from 'react';

// components
import { Text, Input } from '@citizenlab/cl2-component-library';

// utils
import { parsePopulationValue } from './utils';

const PopulationInput = () => {
  const [value, setValue] = useState('');

  const handleChange = (value: string) => {
    const { formattedValue } = parsePopulationValue(value);

    if (formattedValue !== null) {
      setValue(formattedValue);
    }
  };

  return (
    <>
      <Input type="text" value={value} onChange={handleChange} />
      <Text ml="16px" mr="24px">
        50%
      </Text>
    </>
  );
};

export default PopulationInput;
