import React, { ReactNode } from 'react';

import { Box, Input, Text } from '@citizenlab/cl2-component-library';

interface Props {
  id: string;
  label: string;
  value: number | null | undefined;
  min: string;
  error?: ReactNode;
  onChange: (value: string) => void;
}

const NumberSettingRow = ({
  id,
  label,
  value,
  min,
  error,
  onChange,
}: Props) => (
  <Box py="5px">
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="12px"
    >
      <Text as="span" variant="boControl" m="0">
        {label}
      </Text>
      <Box width="88px" flexShrink={0}>
        <Input
          id={id}
          ariaLabel={label}
          variant="bo"
          type="number"
          min={min}
          value={value ? value.toString() : null}
          onChange={onChange}
        />
      </Box>
    </Box>
    {error}
  </Box>
);

export default NumberSettingRow;
