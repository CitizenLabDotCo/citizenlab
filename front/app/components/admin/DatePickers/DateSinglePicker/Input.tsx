import React from 'react';

import { Box, InputContainer, Icon } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../_shared/messages';

interface Props {
  id?: string;
  disabled?: boolean;
  selectedDate?: Date;
  ariaExpanded?: boolean;
  formatDate?: (date: Date) => string;
  onClick: () => void;
}

const Input = ({
  id,
  disabled,
  selectedDate,
  ariaExpanded,
  formatDate = (date: Date) => date.toLocaleDateString(),
  onClick,
}: Props) => {
  const { formatMessage } = useIntl();
  const selectDate = formatMessage(sharedMessages.selectDate);

  return (
    <InputContainer
      onClick={onClick}
      id={id}
      disabled={disabled}
      className="e2e-date-single-picker-input"
      ariaExpanded={ariaExpanded}
    >
      <Box mr="8px">{selectedDate ? formatDate(selectedDate) : selectDate}</Box>
      <Icon name="calendar" height="18px" />
    </InputContainer>
  );
};

export default Input;
