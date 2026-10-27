import React from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';

interface Props {
  id?: string;
  title: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

const SettingToggleRow = ({
  id,
  title,
  description,
  checked,
  disabled,
  onChange,
}: Props) => (
  <Toggle
    id={id}
    variant="bo"
    labelAlign="top"
    checked={checked}
    disabled={disabled}
    onChange={onChange}
    label={
      <Box display="flex" flexDirection="column" gap="2px">
        <Text as="span" variant="boControl" m="0">
          {title}
        </Text>
        {description && (
          <Text as="span" variant="boHelper" m="0">
            {description}
          </Text>
        )}
      </Box>
    }
  />
);

export default SettingToggleRow;
