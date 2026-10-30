import React, { ReactNode } from 'react';

import { Box, Radio, Text, Tooltip } from '@citizenlab/cl2-component-library';

interface Props {
  name: string;
  value: string;
  currentValue: string;
  title: string;
  /** Shown next to the title, like a summary pill. */
  titleAdornment?: ReactNode;
  description: string;
  disabled?: boolean;
  /** Shown in a tooltip and disables the option. */
  disabledReason?: string;
  onChange: () => void;
}

const ChoiceRadio = ({
  name,
  value,
  currentValue,
  title,
  titleAdornment,
  description,
  disabled,
  disabledReason,
  onChange,
}: Props) => (
  <Tooltip
    content={disabledReason}
    disabled={!disabledReason}
    placement="top-start"
    theme="dark"
  >
    <Box>
      <Radio
        variant="bo"
        name={name}
        value={value}
        currentValue={currentValue}
        disabled={disabled || !!disabledReason}
        onChange={onChange}
        label={
          <Box>
            <Box display="flex" alignItems="center" gap="8px">
              <Text variant="boControl" m="0">
                {title}
              </Text>
              {titleAdornment}
            </Box>
            <Text variant="boMicro" m="0" color="coolGrey500">
              {description}
            </Text>
          </Box>
        }
      />
    </Box>
  </Tooltip>
);

export default ChoiceRadio;
