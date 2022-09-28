import React from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { parsePopulationValue } from '../../../utils/options';

interface Props {
  value: number | null;
  percentage?: string;
  disabled: boolean;
  onChange: (value: number | null) => void;
}

const OptionInput = ({ value, percentage, disabled, onChange }: Props) => {
  const handleChange = (stringValue: string) => {
    const newValue = parsePopulationValue(stringValue);

    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  const formattedPopulation =
    value === null ? '' : value.toLocaleString('en-US');

  return (
    <>
      <Box width="70%">
        {disabled ? (
          <Text color="textSecondary" variant="bodyS">
            <FormattedMessage {...messages.itemNotCalculated} />
          </Text>
        ) : (
          <Input
            type="text"
            className="option-population-input"
            value={formattedPopulation}
            onChange={handleChange}
          />
        )}
      </Box>
      <Text width="30%" color="primary">
        <Box as="span" pl="20px">
          {percentage ?? ''}
        </Box>
      </Text>
    </>
  );
};

export default OptionInput;
