import React from 'react';

import { useTheme } from 'styled-components';

import { Box, BoxProps } from '@citizenlab/cl2-component-library';

type Props = {
  bgColor: BoxProps['bgColor'];
};

const ColorIndicator = ({ bgColor }: Props) => {
  const theme = useTheme();

  return (
    <Box
      width="1rem"
      minWidth="1rem"
      height="1rem"
      bgColor={bgColor}
      borderRadius={theme.borderRadius}
      marginRight="0.5rem"
      marginTop="auto"
      marginBottom="auto"
    />
  );
};

export default ColorIndicator;
