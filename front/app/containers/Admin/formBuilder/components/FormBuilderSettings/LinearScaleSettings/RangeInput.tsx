import React from 'react';

// react hook form
import { Controller, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  Label,
  IconTooltip,
  Text,
  Select,
} from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

interface Props {
  maximumName: string;
}

const RangeInput = ({
  maximumName,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { control, setValue } = useFormContext();
  const defaultValues = [{}];

  const rangeOptions = [
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
  ];
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
                      setValue(maximumName, value.value);
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

export default injectIntl(RangeInput);
