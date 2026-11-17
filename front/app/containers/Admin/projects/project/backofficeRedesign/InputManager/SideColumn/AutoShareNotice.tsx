import React, { ReactNode } from 'react';

import { format, parseISO } from 'date-fns';

import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import { phaseStatus } from 'containers/Admin/projects/project/projectPage/phaseRowUtils';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import Banner from 'design-system/Banner';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  phase: IPhaseData;
}

const AutoShareNotice = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const dateLocale = getLocale(useLocale());
  const { end_at: endAt } = phase.attributes;

  let notice: ReactNode = formatMessage(messages.autoShareNoticeNoEndDate);
  if (phaseStatus(phase) === 'past') {
    notice = formatMessage(messages.autoShareNoticeEnded);
  } else if (endAt) {
    notice = (
      <FormattedMessage
        {...messages.autoShareNotice}
        values={{
          date: format(parseISO(endAt), 'd MMMM yyyy', {
            locale: dateLocale,
          }),
        }}
      />
    );
  }

  return (
    // Neutral is the grey notice; it has no live region, so this wrapper announces it.
    <div role="status">
      <Banner tone="neutral">{notice}</Banner>
    </div>
  );
};

export default AutoShareNotice;
