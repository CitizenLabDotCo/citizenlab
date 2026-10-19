import React from 'react';

import { Box, Input } from '@citizenlab/cl2-component-library';

// Past this many choices, a box to narrow them down.
const MAX_UNSEARCHED_CHOICES = 5;

interface Props {
  // How many choices there are before narrowing.
  count: number;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

// The box at the top of a long flyout that narrows its choices by name.
const FlyoutSearch = ({
  count,
  value,
  onChange,
  placeholder,
  label,
}: Props) => {
  if (count <= MAX_UNSEARCHED_CHOICES) return null;

  return (
    <Box mb="4px">
      <Input
        type="text"
        size="small"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        ariaLabel={label}
      />
    </Box>
  );
};

export default FlyoutSearch;
