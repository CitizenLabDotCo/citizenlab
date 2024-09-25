import React from 'react';

import {
  Icon,
  defaultInputStyle,
  Box,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { DateRange } from './typings';

const Container = styled.button`
  ${defaultInputStyle};
  display: flex;
  flex-direction: row;
  font-size: 14px;
`;

interface Props {
  selectedRange: Partial<DateRange>;
}

const Input = ({ selectedRange }: Props) => {
  return (
    <Container>
      <Box mr="8px">
        {selectedRange.from
          ? selectedRange.from.toLocaleDateString()
          : 'Select date'}
      </Box>
      <Icon name="chevron-right" height="16px" />
      <Box ml="8px" mr="12px">
        {selectedRange.to
          ? selectedRange.to.toLocaleDateString()
          : 'Select date'}
      </Box>
      <Icon name="calendar" height="16px" />
    </Container>
  );
};

export default Input;
