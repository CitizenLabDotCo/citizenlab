import React from 'react';

import { Box, Icon } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import InputContainer from '../_shared/InputContainer';
import sharedMessages from '../_shared/messages';
import { DateRange } from '../_shared/typings';

interface Props {
  selectedRange: Partial<DateRange>;
  onClick: () => void;
}

const Input = ({ selectedRange, onClick }: Props) => {
  const { formatMessage } = useIntl();
  const selectDate = formatMessage(sharedMessages.selectDate);

  return (
    <InputContainer onClick={onClick}>
      <Box mr="8px">
        {selectedRange.from
          ? selectedRange.from.toLocaleDateString()
          : selectDate}
      </Box>
      <Icon name="chevron-right" height="18px" />
      <Box ml="8px" mr="12px">
        {selectedRange.to ? selectedRange.to.toLocaleDateString() : selectDate}
      </Box>
    </InputContainer>
  );
};

export default Input;
