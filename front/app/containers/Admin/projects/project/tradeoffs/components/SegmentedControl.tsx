import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

interface Option<T extends string> {
  readonly value: T;
  readonly label: React.ReactNode;
}

interface Props<T extends string> {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: Props<T>) => (
  <Box display="flex" gap="4px" role="group" aria-label={ariaLabel}>
    {options.map((option) => (
      <Button
        key={option.value}
        buttonStyle={option.value === value ? 'primary' : 'secondary-outlined'}
        size="s"
        ariaPressed={option.value === value}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </Button>
    ))}
  </Box>
);

export default SegmentedControl;
