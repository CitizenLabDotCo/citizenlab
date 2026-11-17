import React, { ReactNode } from 'react';

import {
  Box,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const LayerName = styled.div`
  color: ${colors.primary};
  font-size: ${fontSizes.m}px;
  line-height: normal;
  font-weight: 400;
  flex: 1;
  display: flex;
  align-items: center;
`;

interface Props {
  variant: 'default' | 'bo';
  children: ReactNode;
}

const LayerTitle = ({ variant, children }: Props) =>
  variant === 'bo' ? (
    <Box flex="1" display="flex" alignItems="center">
      <Text as="span" variant="boControl" m="0">
        {children}
      </Text>
    </Box>
  ) : (
    <LayerName>{children}</LayerName>
  );

export default LayerTitle;
