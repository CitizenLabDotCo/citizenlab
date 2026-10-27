import React from 'react';

import useLocale from 'hooks/useLocale';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';
import { formatDateRange } from 'containers/Admin/projects/project/projectPage/phaseRowUtils';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';
import pickerMessages from 'components/admin/DatePickers/DatePhasePicker/messages';

import { useIntl } from 'utils/cl-intl';

interface Props {
  startAt: string;
  endAt: string | null | undefined;
}

const DatesSummary = ({ startAt, endAt }: Props) => {
  const { formatMessage } = useIntl();
  const dateLocale = getLocale(useLocale());

  return (
    <SummaryPill
      icon="calendar"
      label={formatDateRange(
        startAt,
        endAt ?? null,
        dateLocale,
        formatMessage(pickerMessages.openEnded)
      )}
    />
  );
};

export default DatesSummary;
