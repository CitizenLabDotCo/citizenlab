import React from 'react';

import { useRouter } from '@tanstack/react-router';

import Link from 'design-system/Link';

import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

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

  const dateRange = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatRange(
    parseBackendDateString(phase.attributes.start_at),
    parseBackendDateString(endAt)
  );

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
