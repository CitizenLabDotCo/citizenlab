import React from 'react';

// components
import styled from 'styled-components';

import { gvTag } from '../../utils/gvTag';
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
    {...gvTag('ListItem')}
    width="100%"
    borderTop={`1px solid ${colors.divider}`}
    borderBottom={`1px solid ${colors.divider}`}
    {...otherProps}
  >
    {children}
  </StyledBox>
);

export default ListItem;
