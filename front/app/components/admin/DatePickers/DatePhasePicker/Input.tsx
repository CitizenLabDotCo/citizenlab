import React from 'react';

import { Icon, Box, InputContainer } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';

import useLocale from 'hooks/useLocale';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../_shared/messages';
import { DateRange } from '../_shared/typings';

import messages from './messages';

interface Props {
  selectedRange: Partial<DateRange>;
  selectedRangeIsOpenEnded: boolean;
  onClick: () => void;
  className?: string;
}

const Input = ({
  selectedRange,
  selectedRangeIsOpenEnded,
  onClick,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const dateLocale = getLocale(locale);
  const selectDate = formatMessage(sharedMessages.selectDate);

  const formatDateTime = (date: Date) => {
    return `${format(date, 'P', { locale: dateLocale })} ${format(date, 'p', {
      locale: dateLocale,
    })}`;
  };

  return (
    <InputContainer
      className={`e2e-date-phase-picker-input ${className}-input`}
      onClick={onClick}
    >
      <Box mr="8px">
        {selectedRange.from ? formatDateTime(selectedRange.from) : selectDate}
      </Box>
      <Icon name="chevron-right" height="18px" />
      <Box ml="8px" mr="12px">
        {selectedRangeIsOpenEnded
          ? formatMessage(messages.openEnded)
          : selectedRange.to
          ? formatDateTime(selectedRange.to)
          : selectDate}
      </Box>
      <Icon name="calendar" height="18px" />
    </InputContainer>
  );
};

export default Input;
