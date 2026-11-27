import React from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';

import Skeleton from 'design-system/Skeleton';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import projectMessages from 'containers/Admin/projects/project/messages';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';

import messages from '../messages';
import { usePdfExportContext } from '../pdf/PdfExportContext';
import wordMessages from '../word/messages';
import { useWordSection } from '../word/useWordSection';

import MethodMetrics from './MethodMetrics';
import MetricCard from './MetricCard';
import styles from './MetricCard.module.css';

interface Props {
  phase: IPhaseData;
}

const ParticipationMetrics = ({ phase }: Props) => {
  const intl = useIntl();
  const redesigned = useProjectBackofficeRedesign();
  const { isPdfRenderMode } = usePdfExportContext();
  const { formatMessage, formatNumber } = intl;
  const { start_at, end_at, participation_method } = phase.attributes;
  const {
    data: response,
    error,
    isLoading,
  } = usePhaseInsights({
    phaseId: phase.id,
  });

  const { data: appConfiguration } = useAppConfiguration();

  const metrics = response?.data.attributes.metrics;
  const isCurrentPhase = pastPresentOrFuture([start_at, end_at]) === 'present';
  // null when the back end could not measure them, as opposed to measuring none
  const participants = metrics?.participants ?? null;
  const participationRate = metrics?.participation_rate_as_percent ?? null;
  // for Konveio, notice to explain where data can be found.
  const showKonveioNotice = participation_method === 'document_annotation';
  const detailed = redesigned && !isPdfRenderMode;
  // A poll's respondents and a volunteering phase's volunteers are its
  // participants, so their own tile replaces the participants one.
  const methodTileCountsParticipants =
    detailed && ['poll', 'volunteering'].includes(participation_method);
  const adminsExcluded =
    !!appConfiguration?.data.attributes.settings.core
      .exclude_admins_and_moderators_from_statistics;
  const visitorsTooltip = detailed
    ? [
        formatMessage(messages.visitorsMetricTooltip),
        ...(adminsExcluded ? [formatMessage(messages.adminsLeftOut)] : []),
      ].join(' ')
    : undefined;

  useWordSection(
    'participation-metrics',
    () => {
      if (!metrics) return [];
      const rows: string[][] = [
        [formatMessage(wordMessages.metric), formatMessage(wordMessages.value)],
      ];

      rows.push([formatMessage(messages.visitors), String(metrics.visitors)]);

      if (participants !== null) {
        rows.push([formatMessage(messages.participants), String(participants)]);
      }

      if (participationRate !== null) {
        rows.push([
          formatMessage(messages.participationRate),
          typeof participationRate === 'number'
            ? `${participationRate.toFixed(1)}%`
            : '-',
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
          String(
            (metrics.voting.online_votes || 0) +
              (metrics.voting.offline_votes || 0)
          ),
        ]);
      }

      if (metrics.proposals) {
        rows.push([
          formatMessage(wordMessages.proposalsPosted),
          String(metrics.proposals.ideas_posted),
        ]);
      }

      if (metrics.volunteering) {
        rows.push([
          formatMessage(messages.volunteerings),
          String(metrics.volunteering.volunteerings),
        ]);
      }

      if (metrics.poll) {
        rows.push([
          formatMessage(messages.responses),
          String(metrics.poll.responses),
        ]);
      }

      if (metrics.common_ground) {
        rows.push([
          formatMessage(messages.ideasPosted),
          String(metrics.common_ground.ideas_posted),
        ]);
        rows.push([
          formatMessage(messages.associatedIdeas),
          String(metrics.common_ground.associated_ideas),
        ]);
        rows.push([
          formatMessage(messages.reactions),
          String(metrics.common_ground.reactions),
        ]);
      }

      return [
        {
          type: 'heading' as const,
          text: formatMessage(wordMessages.participationMetrics),
          level: 2 as const,
        },
        ...(showKonveioNotice
          ? [
              {
                type: 'paragraph' as const,
                text: formatMessage(
                  projectMessages.konveioParticipationDataNotice
                ),
              },
            ]
          : []),
        { type: 'table' as const, rows, columnWidths: [60, 40] },
      ];
    },
    { skip: isLoading || !!error || !metrics }
  );

  if (isLoading && redesigned && !isPdfRenderMode) {
    return (
      <Box display="flex" gap="10px" aria-busy="true">
        {[0, 1, 2, 3, 4].map((column) => (
          <Skeleton
            key={column}
            shape="block"
            height={102}
            className={styles.panelMetric}
          />
        ))}
      </Box>
    );
  }

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

  if (!metrics) {
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

  return (
    <Box display="flex" flexDirection="column" gap="16px" w="100%">
      {showKonveioNotice && (!redesigned || isPdfRenderMode) && (
        <Warning>
          {formatMessage(projectMessages.konveioParticipationDataNotice)}
        </Warning>
      )}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={detailed && !methodTileCountsParticipants ? '10px' : '16px'}
        w="100%"
        className={methodTileCountsParticipants ? styles.fourTiles : undefined}
      >
        <MetricCard
          label={formatMessage(messages.visitors)}
          value={metrics.visitors}
          icon="user-circle"
          change={
            isCurrentPhase ? metrics.visitors_7_day_percent_change : undefined
          }
          labelTooltip={visitorsTooltip}
        />
        {participants !== null && !methodTileCountsParticipants && (
          <MetricCard
            label={formatMessage(messages.participants)}
            value={participants}
            icon="sidebar-users"
            change={
              isCurrentPhase
                ? metrics.participants_7_day_percent_change
                : undefined
            }
            labelTooltip={formatMessage(
              messages.phaseParticipantsMetricTooltip2
            )}
          />
        )}
        <MethodMetrics
          participationMethod={participation_method}
          inputTerm={detailed ? phase.attributes.input_term : undefined}
          phaseId={detailed ? phase.id : undefined}
          metrics={metrics}
          showChange={isCurrentPhase}
        />
        {participationRate !== null && (
          <MetricCard
            label={formatMessage(
              detailed && participation_method === 'poll'
                ? messages.responseRate
                : messages.participationRate
            )}
            value={
              participationRate ===
              'participant_count_compared_with_zero_visitors'
                ? '-'
                : formatNumber(participationRate / 100, {
                    style: 'percent',
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })
            }
            icon="chart-bar"
            change={
              isCurrentPhase
                ? metrics.participation_rate_7_day_percent_change
                : undefined
            }
            labelTooltip={formatMessage(
              messages.participationRateExplanationTooltip
            )}
            valueTooltip={
              participationRate ===
              'participant_count_compared_with_zero_visitors'
                ? formatMessage(
                    messages.cannotCalculateParticipationRateZeroVisitors
                  )
                : undefined
            }
          />
        )}
      </Box>
    </Box>
  );
};

export default ParticipationMetrics;
