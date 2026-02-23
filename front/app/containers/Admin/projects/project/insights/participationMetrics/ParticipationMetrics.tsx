import React from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';

import messages from '../messages';
import wordMessages from '../word/messages';
import { useWordSection } from '../word/useWordSection';

import MethodMetrics from './MethodMetrics';
import MetricCard from './MetricCard';

interface Props {
  phase: IPhaseData;
}

const ParticipationMetrics = ({ phase }: Props) => {
  const intl = useIntl();
  const { formatMessage, formatNumber } = intl;
  const { start_at, end_at, participation_method } = phase.attributes;
  const {
    data: response,
    error,
    isLoading,
  } = usePhaseInsights({
    phaseId: phase.id,
  });

  const metrics = response?.data.attributes.metrics;
  const isCurrentPhase = pastPresentOrFuture([start_at, end_at]) === 'present';

  // Register native Word table serializer — editable data table, not a screenshot
  useWordSection(
    'participation-metrics',
    () => {
      if (!metrics) return [];
      // metricsConverter returns (Paragraph | Table)[] — wrap as 'table' type sections
      // Note: metricsConverter returns docx objects, not WordSection[]. We use it
      // directly in the renderer via a raw docx section type.
      // TODO: Migrate metricsConverter to return WordSection[] in a follow-up.
      // For now, use a simple table representation.
      const rows: string[][] = [
        [formatMessage(wordMessages.metric), formatMessage(wordMessages.value)],
      ];

      rows.push([formatMessage(messages.visitors), String(metrics.visitors)]);
      rows.push([
        formatMessage(messages.participants),
        String(metrics.participants),
      ]);

      if (typeof metrics.participation_rate_as_percent === 'number') {
        rows.push([
          formatMessage(messages.participationRate),
          `${metrics.participation_rate_as_percent.toFixed(1)}%`,
        ]);
      }

      if (metrics.ideation) {
        rows.push([
          formatMessage(messages.ideasPosted),
          String(metrics.ideation.ideas_posted),
        ]);
        rows.push([
          formatMessage(wordMessages.commentsPosted),
          String(metrics.ideation.comments_posted),
        ]);
        rows.push([
          formatMessage(messages.reactions),
          String(metrics.ideation.reactions),
        ]);
      }

      if (metrics.native_survey) {
        rows.push([
          formatMessage(wordMessages.surveysSubmitted),
          String(metrics.native_survey.surveys_submitted),
        ]);
        if (
          typeof metrics.native_survey.completion_rate_as_percent === 'number'
        ) {
          rows.push([
            formatMessage(messages.completionRate),
            `${metrics.native_survey.completion_rate_as_percent.toFixed(1)}%`,
          ]);
        }
      }

      if (metrics.voting) {
        rows.push([
          formatMessage(messages.voters),
          String(metrics.voting.voters),
        ]);
        rows.push([
          formatMessage(messages.votes),
          String(metrics.voting.online_votes + metrics.voting.offline_votes),
        ]);
      }

      if (metrics.proposals) {
        rows.push([
          formatMessage(wordMessages.proposalsPosted),
          String(metrics.proposals.ideas_posted),
        ]);
      }

      return [{ type: 'table', rows, columnWidths: [60, 40] }];
    },
    { skip: isLoading || !!error || !metrics }
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexWrap="wrap"
        alignContent="center"
        gap="24px"
        flexGrow={1}
      >
        <Spinner size="24px" />
      </Box>
    );
  }

  if (!response) {
    return (
      <Box
        display="flex"
        flexWrap="wrap"
        alignContent="center"
        gap="24px"
        flexGrow={1}
      >
        <Text color="error">{formatMessage(messages.errorLoadingMetrics)}</Text>
      </Box>
    );
  }

  const { participation_rate_as_percent } = metrics!;

  return (
    <Box display="flex" flexWrap="wrap" gap="16px" w="100%">
      <MetricCard
        label={formatMessage(messages.visitors)}
        value={metrics!.visitors}
        icon="user-circle"
        change={
          isCurrentPhase ? metrics!.visitors_7_day_percent_change : undefined
        }
      />
      <MetricCard
        label={formatMessage(messages.participants)}
        value={metrics!.participants}
        icon="sidebar-users"
        change={
          isCurrentPhase
            ? metrics!.participants_7_day_percent_change
            : undefined
        }
        labelTooltip={formatMessage(messages.phaseParticipantsMetricTooltip2)}
      />
      <MethodMetrics
        participationMethod={participation_method}
        metrics={metrics!}
        showChange={isCurrentPhase}
      />
      <MetricCard
        label={formatMessage(messages.participationRate)}
        value={
          participation_rate_as_percent ===
          'participant_count_compared_with_zero_visitors'
            ? '-'
            : formatNumber(participation_rate_as_percent / 100, {
                style: 'percent',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })
        }
        icon="chart-bar"
        change={
          isCurrentPhase
            ? metrics!.participation_rate_7_day_percent_change
            : undefined
        }
        labelTooltip={formatMessage(
          messages.participationRateExplanationTooltip
        )}
        valueTooltip={
          participation_rate_as_percent ===
          'participant_count_compared_with_zero_visitors'
            ? formatMessage(
                messages.cannotCalculateParticipationRateZeroVisitors
              )
            : undefined
        }
      />
    </Box>
  );
};

export default ParticipationMetrics;
