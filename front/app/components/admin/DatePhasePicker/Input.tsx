import React from 'react';

import {
  Icon,
  defaultInputStyle,
  Box,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { DateRange } from './typings';

const Container = styled.button`
  ${defaultInputStyle};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${fontSizes.base}px;

  color: ${colors.grey800};

  &:hover,
  &:focus {
    color: ${colors.black};
  }

  svg {
    fill: ${colors.grey700};
  }

  &:hover svg,
  &:focus svg {
    fill: ${colors.black};
  }
`;

interface Props {
  selectedRange: Partial<DateRange>;
  selectedRangeIsOpenEnded: boolean;
  onClick: () => void;
}

const Input = ({ selectedRange, selectedRangeIsOpenEnded, onClick }: Props) => {
  const { formatMessage } = useIntl();
  const selectDate = formatMessage(messages.selectDate);

  return (
    <Container
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <Box mr="8px">
        {selectedRange.from
          ? selectedRange.from.toLocaleDateString()
          : selectDate}
      </Box>
      <Icon name="chevron-right" height="18px" />
      <Box ml="8px" mr="12px">
        {selectedRangeIsOpenEnded
          ? formatMessage(messages.openEnded)
          : selectedRange.to
          ? selectedRange.to.toLocaleDateString()
          : selectDate}
      </Box>
      <Icon name="calendar" height="18px" />
    </Container>
  );
};

export default Input;
