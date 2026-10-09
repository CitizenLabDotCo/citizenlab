import React from 'react';

import { Box, Radio, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import { VisibilityOption } from '../../visibilityOptions';

interface Props<T extends string> {
  name: string;
  option: VisibilityOption<T>;
  currentValue: T;
  onChange: (value: T) => void;
}

const ChoiceRadio = <T extends string>({
  name,
  option,
  currentValue,
  onChange,
}: Props<T>) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const checked = option.value === currentValue;

  return (
    <Radio
      variant="bo"
      name={name}
      value={option.value}
      currentValue={currentValue}
      buttonColor={theme.colors.tenantPrimary}
      onChange={onChange}
      label={
        <Box display="flex" flexDirection="column" gap="2px">
          <Text
            variant="boControl"
            color={checked ? undefined : 'coolGrey700'}
            m="0px"
          >
            {formatMessage(option.label)}
          </Text>
          <Text variant="boMicro" color="coolGrey500" lineHeight="16px" m="0px">
            {formatMessage(option.description)}
          </Text>
        </Box>
      }
    />
  );
};

export default ChoiceRadio;
