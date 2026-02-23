import { Table, Paragraph } from 'docx';

import type {
  PhaseInsightsParticipationMetrics,
  SevenDayChange,
} from 'api/phase_insights/types';

import { createSimpleTable } from 'utils/word/converters/tableConverter';
import { createHeading } from 'utils/word/converters/textConverter';

import messages from '../messages';

import type { WordExportIntl } from './types';

/**
 * Formats a 7-day change value for display.
 */
function formatChange(
  change: SevenDayChange | undefined,
  _formatMessage: WordExportIntl['formatMessage']
): string {
  if (change === undefined || change === null) {
    return '-';
  }
  if (typeof change === 'string') {
    return '-';
  }
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Formats a number with locale-specific formatting.
 */
function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Formats a percentage value.
 */
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Creates participation metrics as a Word table.
 */
export function createMetricsSection(
  metrics: PhaseInsightsParticipationMetrics,
  intl: WordExportIntl,
  showChanges: boolean = true
): (Paragraph | Table)[] {
  const { formatMessage } = intl;

  // Build table data
  const headers = [
    formatMessage(messages.metric),
    formatMessage(messages.value),
  ];
  if (showChanges) {
    headers.push(formatMessage(messages.change));
  }

  const rows: (string | number)[][] = [headers];

  // Base metrics
  rows.push(
    createMetricRow(
      formatMessage(messages.visitors),
      formatNumber(metrics.visitors),
      showChanges
        ? formatChange(metrics.visitors_7_day_percent_change, formatMessage)
        : undefined
    )
  );

  rows.push(
    createMetricRow(
      formatMessage(messages.participants),
      formatNumber(metrics.participants),
      showChanges
        ? formatChange(metrics.participants_7_day_percent_change, formatMessage)
        : undefined
    )
  );

  rows.push(
    createMetricRow(
      formatMessage(messages.participationRate),
      typeof metrics.participation_rate_as_percent === 'number'
        ? formatPercent(metrics.participation_rate_as_percent)
        : '-',
      showChanges
        ? formatChange(
            metrics.participation_rate_7_day_percent_change,
            formatMessage
          )
        : undefined
    )
  );

  // Method-specific metrics
  if (metrics.ideation) {
    rows.push(
      createMetricRow(
        formatMessage(messages.ideasPosted),
        formatNumber(metrics.ideation.ideas_posted),
        showChanges
          ? formatChange(
              metrics.ideation.ideas_posted_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
    rows.push(
      createMetricRow(
        formatMessage(messages.commentsPosted),
        formatNumber(metrics.ideation.comments_posted),
        showChanges
          ? formatChange(
              metrics.ideation.comments_posted_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
    rows.push(
      createMetricRow(
        formatMessage(messages.reactions),
        formatNumber(metrics.ideation.reactions),
        showChanges
          ? formatChange(
              metrics.ideation.reactions_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
  }

  if (metrics.proposals) {
    rows.push(
      createMetricRow(
        formatMessage(messages.proposalsPosted),
        formatNumber(metrics.proposals.ideas_posted),
        showChanges
          ? formatChange(
              metrics.proposals.ideas_posted_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
    rows.push(
      createMetricRow(
        formatMessage(messages.reachedThreshold),
        formatNumber(metrics.proposals.reached_threshold),
        showChanges
          ? formatChange(
              metrics.proposals.reached_threshold_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
    rows.push(
      createMetricRow(
        formatMessage(messages.commentsPosted),
        formatNumber(metrics.proposals.comments_posted),
        showChanges
          ? formatChange(
              metrics.proposals.comments_posted_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
  }

  if (metrics.native_survey) {
    rows.push(
      createMetricRow(
        formatMessage(messages.surveysSubmitted),
        formatNumber(metrics.native_survey.surveys_submitted),
        showChanges
          ? formatChange(
              metrics.native_survey.surveys_submitted_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
    rows.push(
      createMetricRow(
        formatMessage(messages.completionRate),
        typeof metrics.native_survey.completion_rate_as_percent === 'number'
          ? formatPercent(metrics.native_survey.completion_rate_as_percent)
          : '-',
        showChanges
          ? formatChange(
              metrics.native_survey.completion_rate_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
  }

  if (metrics.voting) {
    rows.push(
      createMetricRow(
        formatMessage(messages.voters),
        formatNumber(metrics.voting.voters),
        showChanges
          ? formatChange(
              metrics.voting.voters_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
    rows.push(
      createMetricRow(
        formatMessage(messages.votes),
        formatNumber(
          metrics.voting.online_votes + metrics.voting.offline_votes
        ),
        showChanges
          ? formatChange(
              metrics.voting.online_votes_7_day_percent_change,
              formatMessage
            )
          : undefined
      )
    );
  }

  const result: (Paragraph | Table)[] = [
    createHeading(formatMessage(messages.participationMetrics), 2),
    createSimpleTable(rows, {
      columnWidths: showChanges ? [50, 25, 25] : [60, 40],
    }),
  ];

  return result;
}

function createMetricRow(
  label: string,
  value: string,
  change?: string
): string[] {
  const row = [label, value];
  if (change !== undefined) {
    row.push(change);
  }
  return row;
}
