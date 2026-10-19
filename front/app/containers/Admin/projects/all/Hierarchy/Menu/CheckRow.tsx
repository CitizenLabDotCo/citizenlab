import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { rowStyle } from './MenuRow';

// The box shows on hover, on focus and once ticked, so an untouched list
// reads as plain names.
const Row = styled.button`
  ${rowStyle}
  gap: 8px;

  .check-box {
    opacity: 0;
    transition: opacity 0.1s ease;
  }

  &:hover .check-box,
  &:focus-visible .check-box,
  &[aria-checked='true'] .check-box {
    opacity: 1;
  }
`;

interface Props {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

// A menu row that turns something on or off, and stays open for the next.
const CheckRow = ({ label, checked, onToggle }: Props) => (
  <Row
    type="button"
    role="menuitemcheckbox"
    aria-checked={checked}
    onClick={onToggle}
  >
    <Box
      className="check-box"
      flex="none"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="17px"
      height="17px"
      border={`1px solid ${checked ? colors.blue500 : colors.coolGrey300}`}
      borderRadius={stylingConsts.borderRadius}
      bgColor={checked ? colors.blue500 : undefined}
    >
      {checked && (
        <Icon name="check" width="11px" height="11px" fill={colors.white} />
      )}
    </Box>
    {/* Long labels wrap, so names that start alike stay apart. */}
    <Box flex="1" minWidth="0">
      <Text as="span" m="0" variant="boControl">
        {label}
      </Text>
    </Box>
  </Row>
);

export default CheckRow;
