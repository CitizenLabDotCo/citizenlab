import React from 'react';

import { useRouter } from '@tanstack/react-router';
import { format, isSameMonth, isSameYear } from 'date-fns';

import Link from 'design-system/Link';

import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import projectPageMessages from 'containers/Admin/projects/project/projectPage/messages';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import messages from './messages';
import usePhaseViews from './usePhaseViews';

interface Props {
  phase: IPhaseData;
  endAt: string;
}

const LateParticipationDescription = ({ phase, endAt }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const router = useRouter();
  const manageView = usePhaseViews(phase).find((view) => view.key === 'manage');
  const { input_term: inputTerm, participation_method: method } =
    phase.attributes;

  // Day first, with the parts the two dates share written once: "2 to 7 October 2026".
  const dateLocale = getLocale(locale);
  const start = parseBackendDateString(phase.attributes.start_at);
  const end = parseBackendDateString(endAt);
  const startPattern = !isSameYear(start, end)
    ? 'd MMMM yyyy'
    : isSameMonth(start, end)
    ? 'd'
    : 'd MMMM';
  const dateRange = formatMessage(projectPageMessages.phaseDateRange, {
    startDate: format(start, startPattern, { locale: dateLocale }),
    endDate: format(end, 'd MMMM yyyy', { locale: dateLocale }),
  });

  // Surveys have no Manage tab, so there is nowhere to send the reader.
  if (!manageView) {
    return (
      <FormattedMessage
        {...messages.insightsCoversResponsesExcluded}
        values={{ dateRange }}
      />
    );
  }

  const manageLink = (
    <Link
      href={
        router.buildLocation({
          to: `/$locale${manageView.to}` as const,
          params: {
            locale,
            projectId: phase.relationships.project.data.id,
            phaseId: phase.id,
          },
        }).href
      }
    >
      {formatMessage(messages.manageTabLink)}
    </Link>
  );

  return method === 'voting' ? (
    <FormattedMessage
      {...messages.insightsCoversVotesInManage}
      values={{ dateRange, manageLink }}
    />
  ) : (
    <FormattedMessage
      {...messages.insightsCoversInputsInManage}
      values={{ dateRange, inputTerm, manageLink }}
    />
  );
};

export default LateParticipationDescription;
