import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import InputContainer from '../_shared/InputContainer';
import sharedMessages from '../_shared/messages';

interface Props {
  id?: string;
  disabled?: boolean;
  selectedDate?: Date;
  onClick: () => void;
}

const Input = ({ id, disabled, selectedDate, onClick }: Props) => {
  const { formatMessage } = useIntl();
  const selectDate = formatMessage(sharedMessages.selectDate);

  return (
    <InputContainer onClick={onClick} id={id} disabled={disabled}>
      <Box mr="8px">
        {selectedDate ? selectedDate.toLocaleDateString() : selectDate}
      </Box>
    </InputContainer>
  );
};

export default Input;
