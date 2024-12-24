import React from 'react';

import { Icon } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../../_shared/messages';
import { DateRange } from '../../_shared/typings';
import { SelectionMode } from '../typings';

import DateButton from './DateButton';
import InputContainer from './InputContainer';

interface Props {
  selectedRange: Partial<DateRange>;
  selectionMode?: SelectionMode;
  onClickFrom: () => void;
  onClickTo: () => void;
}

const Input = ({
  selectedRange,
  selectionMode,
  onClickFrom,
  onClickTo,
}: Props) => {
  const { formatMessage } = useIntl();
  const selectDate = formatMessage(sharedMessages.selectDate);

  return (
    <InputContainer>
      <DateButton isSelected={selectionMode === 'from'} onClick={onClickFrom}>
        {selectedRange.from
          ? selectedRange.from.toLocaleDateString()
          : selectDate}
      </DateButton>
      <Icon name="chevron-right" height="18px" />
      <DateButton
        isSelected={selectionMode === 'to'}
        mr="2px"
        onClick={onClickTo}
      >
        {selectedRange.to ? selectedRange.to.toLocaleDateString() : selectDate}
      </DateButton>
    </InputContainer>
  );
};

export default Input;
