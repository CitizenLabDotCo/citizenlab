import React from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
        {disabled ? (
          <Text color="secondaryText" variant="bodyS">
            <FormattedMessage {...messages.itemNotCalculated} />
          </Text>
        ) : (
          <Input
            type="text"
            value={formattedPopulation}
            onChange={handleChange}
          />
        )}
      </Box>
      <Text width="30%" color="adminTextColor">
        <Box as="span" pl="20px">
          {percentage ?? ''}
        </Box>
      </Text>
    </>
  );
};

export default OptionInput;
