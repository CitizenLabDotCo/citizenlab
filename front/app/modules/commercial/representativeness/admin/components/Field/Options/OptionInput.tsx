import React from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';

// utils
import { parsePopulationValue } from './utils';

interface Props {
  value?: number;
  percentage?: string;
  onChange: (value?: number) => void;
}

const OptionInput = ({ value, percentage, onChange }: Props) => {
  const handleChange = (stringValue: string) => {
    const newValue = parsePopulationValue(stringValue);

    if (newValue !== null) {
      onChange(newValue);
    }
  };

  const formattedPopulation =
    value === undefined ? '' : value.toLocaleString('en-US');

  return (
    <>
      <Box width="70%">
        <Input
          type="text"
          value={formattedPopulation}
          onChange={handleChange}
        />
      </Box>
      <Text width="30%" color="adminTextColor">
        <Box pl="20px">{percentage ?? ''}</Box>
      </Text>
    </>
  );
};

export default OptionInput;
