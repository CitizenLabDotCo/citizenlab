import React from 'react';

import { Box, Icon, bo, colors } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../_shared/messages';
import { DateRange } from '../_shared/typings';

import messages from './messages';

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid ${colors.grey300};
  border-radius: ${bo.borderRadius};
  background: ${colors.white};
  font-size: ${bo.controlFontSize}px;
  color: ${bo.colors.textHeadingStrong};
  cursor: pointer;

  &:hover {
    border-color: ${colors.coolGrey500};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.tenantPrimary};
  }
`;

interface Props {
  selectedRange: Partial<DateRange>;
  selectedRangeIsOpenEnded: boolean;
  calendarOpen: boolean;
  onClick: () => void;
  className?: string;
}

const BoInput = ({
  selectedRange,
  selectedRangeIsOpenEnded,
  calendarOpen,
  onClick,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const dateLocale = getLocale(useLocale());
  const selectDate = formatMessage(sharedMessages.selectDate);
  const formatDateTime = (date: Date) =>
    format(date, 'P p', { locale: dateLocale });

  const end = () => {
    if (selectedRangeIsOpenEnded) return formatMessage(messages.openEnded);
    return selectedRange.to ? formatDateTime(selectedRange.to) : selectDate;
  };

  return (
    <Trigger
      type="button"
      className={`e2e-date-phase-picker-input ${className}-input`}
      aria-expanded={calendarOpen}
      onClick={onClick}
    >
      <Icon
        name="calendar"
        width="16px"
        height="16px"
        fill={colors.coolGrey500}
      />
      <Box as="span">
        {selectedRange.from ? formatDateTime(selectedRange.from) : selectDate}
      </Box>
      <Icon
        name="arrow-right"
        width="14px"
        height="14px"
        fill={bo.colors.crumbSeparator}
      />
      <Box as="span">{end()}</Box>
    </Trigger>
  );
};

export default BoInput;
