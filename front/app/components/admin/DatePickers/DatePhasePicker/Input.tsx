import React from 'react';

import { Icon, Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import InputContainer from '../_shared/InputContainer';
import sharedMessages from '../_shared/messages';
import { DateRange } from '../_shared/typings';

import messages from './messages';

interface Props {
  selectedRange: Partial<DateRange>;
  selectedRangeIsOpenEnded: boolean;
  onClick: () => void;
}

const Input = ({ selectedRange, selectedRangeIsOpenEnded, onClick }: Props) => {
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
        {selectedRangeIsOpenEnded
          ? formatMessage(messages.openEnded)
          : selectedRange.to
          ? selectedRange.to.toLocaleDateString()
          : selectDate}
      </Box>
    </InputContainer>
  );
};

export default Input;
