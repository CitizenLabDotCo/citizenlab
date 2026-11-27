import React from 'react';

import { PollMetrics as PollMetricsType } from 'api/phase_insights/types';
import usePollQuestions from 'api/poll_questions/usePollQuestions';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import MetricCard from '../MetricCard';

interface Props {
  metrics: PollMetricsType;
  // Set in the redesigned workspace only, which adds the questions tile.
  phaseId?: string;
  showChange: boolean;
}

const PollMetrics = ({ metrics, phaseId, showChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: questions } = usePollQuestions({
    phaseId: phaseId ?? '',
    enabled: !!phaseId,
  });
  const change = showChange ? metrics.responses_7_day_percent_change : undefined;

  if (!phaseId) {
    return (
      <MetricCard
        label={formatMessage(messages.responses)}
        value={metrics.responses}
        icon="vote-ballot"
        change={change}
      />
    );
  }

  return (
    <>
      <MetricCard
        label={formatMessage(messages.respondents)}
        value={metrics.responses}
        icon="vote-ballot"
        change={change}
      />
      <MetricCard
        label={formatMessage(messages.pollQuestions)}
        value={questions?.data.length ?? '-'}
        icon="survey"
      />
    </>
  );
};

export default PollMetrics;
