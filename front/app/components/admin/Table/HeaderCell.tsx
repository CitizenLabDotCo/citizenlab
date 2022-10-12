import React from 'react';

// components
import {
  Box,
  BoxProps,
  Icon,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface Props extends BoxProps {
  colSpan?: `${number}`;
  clickable?: boolean;
  sortDirection?: 'ascending' | 'descending';
  infoTooltip?: React.ReactChild;
}

const StyledBox = styled(Box)<{ clickable?: boolean }>`
  ${({ clickable }) =>
    !clickable
      ? ''
      : `
    &:hover {
      cursor: pointer;
      background: ${colors.grey200};
    }
  `}
`;

const HeaderCell = ({
  children,
  colSpan,
  sortDirection,
  infoTooltip,
  ...otherProps
}: Props) => (
  <StyledBox as="th" p="12px" colSpan={colSpan as any} {...otherProps}>
    {children}

    {sortDirection && (
      <Icon
        name={sortDirection === 'ascending' ? 'chevron-up' : 'chevron-down'}
        width="10px"
        fill={colors.primary}
        ml="8px"
        transform="translate(0,-1)"
      />
    )}

    {infoTooltip && (
      <IconTooltip
        ml="8px"
        iconColor={colors.teal700}
        iconHoverColor="#000"
        iconSize="16px"
        theme="light"
        transform="translate(0,-1)"
        content={infoTooltip}
      />
    )}
  </StyledBox>
);

export default HeaderCell;
