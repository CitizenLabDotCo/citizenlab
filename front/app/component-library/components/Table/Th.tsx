import React from 'react';

// components
import styled from 'styled-components';

import { colors } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';
import Icon from '../Icon';
import IconTooltip from '../IconTooltip';

// styling

export interface Props extends BoxProps {
  colSpan?: number;
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
      background: ${colors.grey200};
    }
    cursor: pointer;
  `}
`;

const Th = ({
  children,
  colSpan,
  sortDirection,
  infoTooltip,
  ...otherProps
}: Props) => (
  <StyledBox as="th" p="12px" colSpan={colSpan} {...otherProps}>
    {children}

    {sortDirection && (
      <Icon
        name={sortDirection === 'ascending' ? 'chevron-up' : 'chevron-down'}
        width="16px"
        height="16px"
        fill={colors.primary}
        ml="8px"
        transform="translate(0,-1)"
      />
    )}

    {infoTooltip && (
      <IconTooltip
        display="inline"
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

export default Th;
