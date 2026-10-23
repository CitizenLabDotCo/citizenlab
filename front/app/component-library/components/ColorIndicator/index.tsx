import React from 'react';

import { Box, BoxProps } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { gvTag } from '../../../design-system/tags';

type Props = {
  bgColor: BoxProps['bgColor'];
};

const ColorIndicator = ({ bgColor }: Props) => {
  const theme = useTheme();

  return (
    <Box
      {...gvTag('ColorIndicator')}
      width="1rem"
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
