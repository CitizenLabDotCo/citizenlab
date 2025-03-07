import React from 'react';

import {
  Box,
  Label,
  IconTooltip,
  Text,
  Select,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  maximumName: string;
  inputType: 'linear_scale' | 'rating' | 'matrix_linear_scale';
}

const RangeInput = ({ maximumName, inputType }: Props) => {
  const { control, setValue } = useFormContext();
  const defaultValues = [{}];
  const { formatMessage } = useIntl();

  const rangeOptions = [
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
    { value: 11, label: '11' },
  ].filter((option) => (inputType === 'rating' ? option.value <= 10 : true));

  return (
    <Controller
      name={maximumName}
      control={control}
      defaultValue={defaultValues}
      render={({ field: { ref: _ref, value } }) => {
        return (
          <>
            <Box marginBottom="8px">
              <Label>
                {formatMessage(messages.range)}
                <IconTooltip
                  maxTooltipWidth={250}
                  content={formatMessage(messages.selectRangeTooltip)}
                />
              </Label>
              <Box display="flex" gap={'16px'}>
                <Text fontWeight="bold">{'1'}</Text>
                <Text>{formatMessage(messages.toLabel)}</Text>
                <Box width="60px" my="auto">
                  <Select
                    value={value}
                    options={rangeOptions}
                    onChange={(value) => {
                      setValue(maximumName, value.value, { shouldDirty: true });
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </>
        );
      }}
    />
  );
};

export default RangeInput;
