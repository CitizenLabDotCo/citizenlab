import React from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';

// utils
import { parsePopulationValue } from './utils';

interface Props {
  value?: number;
  percentage?: string;
  disabled: boolean;
  onChange: (value?: number) => void;
}

const OptionInput = ({ value, percentage, disabled, onChange }: Props) => {
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
          disabled={disabled}
        />
      </Box>
      <Text width="30%" color="adminTextColor">
        <Box pl="20px">{percentage ?? ''}</Box>
      </Text>
    </>
  );
};

export default OptionInput;
