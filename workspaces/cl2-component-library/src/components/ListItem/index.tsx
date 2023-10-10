import React from 'react';

// components
import Box, { BoxProps } from '../Box';
import { colors } from '../../utils/styleUtils';

// styling
import styled from 'styled-components';

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
