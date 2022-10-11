import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface Props extends BoxProps {
  colSpan?: `${number}`;
  clickable?: boolean;
}

const StyledBox = styled(Box)<{ clickable?: boolean }>`
  ${({ clickable }) =>
    !clickable
      ? ''
      : `
    &:hover {
      background: ${colors.grey200};
      cursor: pointer;
    }
  `}
`;

const HeaderCell = ({ children, colSpan, ...otherProps }: Props) => (
  <StyledBox as="th" p="12px" colSpan={colSpan as any} {...otherProps}>
    {children}
  </StyledBox>
);

export default HeaderCell;
