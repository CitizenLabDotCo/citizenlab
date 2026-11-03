import React from 'react';

import { bo, Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// A button only for the hover and pressed states, which Box props can't express.
const RowButton = styled.button`
  display: block;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: ${bo.borderRadius};
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover,
  &[aria-pressed='true'] {
    background: ${colors.grey100};
  }
`;

interface Props {
  label: string;
  value: number;
  /** Makes the row a toggle, e.g. to filter the list by what it counts. */
  onClick?: () => void;
  pressed?: boolean;
}

const StatRow = ({ label, value, onClick, pressed = false }: Props) => {
  const content = (
    <>
      <Text variant="boHelper" m="0">
        {label}
      </Text>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="6px"
        mt="16px"
      >
        <Text
          variant="boSection"
          fontSize="xxxl"
          fontWeight="normal"
          lineHeight="1"
          m="0"
        >
          {value}
        </Text>
        {onClick && (
          <Icon name="chevron-right" width="16px" fill={colors.coolGrey500} />
        )}
      </Box>
    </>
  );

  if (!onClick) return <Box p="8px">{content}</Box>;

  return (
    <RowButton type="button" aria-pressed={pressed} onClick={onClick}>
      {content}
    </RowButton>
  );
};

export default StatRow;
