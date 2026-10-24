import React from 'react';

// components
import styled from 'styled-components';

import { colors } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';

// styling

const StyledBox = styled(Box)`
  & + & {
    border-top: none;
  }
`;

const ListItem = ({ children, ...otherProps }: BoxProps) => (
  <StyledBox
    width="100%"
    borderTop={`1px solid ${colors.divider}`}
    borderBottom={`1px solid ${colors.divider}`}
    {...otherProps}
  >
    {children}
  </StyledBox>
);

export default ListItem;
