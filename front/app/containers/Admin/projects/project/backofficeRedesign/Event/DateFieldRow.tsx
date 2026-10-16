import React, { ReactNode } from 'react';

import {
  Box,
  Icon,
  IconNames,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 36px;
  padding: 0 6px 0 12px;
  box-sizing: border-box;
  border: 1px solid ${colors.grey300};
  border-radius: ${bo.borderRadius};
  background: ${colors.white};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.tenantPrimary};
  }
`;

interface Props {
  icon: IconNames;
  children: ReactNode;
}

// One bordered row of date or time pickers, each in a DateFieldSegment.
const DateFieldRow = ({ icon, children }: Props) => (
  <Row>
    <Box display="flex" mr="4px">
      <Icon name={icon} width="16px" height="16px" fill={colors.coolGrey500} />
    </Box>
    {children}
  </Row>
);

export default DateFieldRow;
