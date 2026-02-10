import React, { useState } from 'react';

import {
  Box,
  IconButton,
  colors,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { useParams, useSearch } from 'utils/router';

import { IInsightData } from 'api/analysis_insights/types';
import useDeleteAnalysisInsight from 'api/analysis_insights/useDeleteAnalysisInsight';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import InsightBody from './InsightBody';
import InsightFooter from './InsightFooter';
import messages from './messages';
import Rate from './Rate';
import SummaryHeader from './SummaryHeader';
import { removeRefs } from './util';

type Props = {
  insight: IInsightData;
};

const Summary = ({ insight }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearch({ strict: false });
  const { formatMessage } = useIntl();
  const { analysisId, projectId } = useParams({ strict: false }) as {
    analysisId: string;
    projectId: string;
  };
  const { mutate: deleteSummary } = useDeleteAnalysisInsight();
  const { data: summary } = useAnalysisSummary({
    analysisId,
    id: insight.relationships.insightable.data.id,
  });

  const fileIds = summary?.data.relationships.files?.data.map(
    (file) => file.id
  );

  const handleSummaryDelete = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteSummaryConfirmation))) {
      deleteSummary(
        {
          analysisId,
          id,
        },
        {
          onSuccess: () => {
            trackEventByName(tracks.summaryDeleted, {
              analysisId,
            });
          },
        }
      );
    }
  };

  if (!summary) return null;

  const phaseId = searchParams.get('phase_id') || undefined;

  const handleRestoreFilters = () => {
    setSearchParams({
      ...(phaseId
        ? {
            phase_id: phaseId,
          }
        : {}),
      reset_filters: 'true',
    });
    const filters = summary.data.attributes.filters;
    updateSearchParams(filters);
    if (filters.tag_ids?.length === 1) {
      const element = document.getElementById(`tag-${filters.tag_ids[0]}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const summaryText = summary.data.attributes.summary;

  return (
    <Box
      key={summary.data.id}
      my="14px"
      position="relative"
      data-cy="e2e-analysis-summary"
    >
      <Box display="flex" flexDirection="column" gap="8px">
        <SummaryHeader showAiWarning={false} />
        <InsightBody
          text={summaryText}
          filters={summary.data.attributes.filters}
          fileIds={fileIds}
          analysisId={analysisId}
          projectId={projectId}
          phaseId={phaseId}
          backgroundTaskId={summary.data.relationships.background_task.data.id}
        />
        <InsightFooter
          filters={summary.data.attributes.filters}
          generatedAt={summary.data.attributes.created_at}
          analysisId={analysisId}
          projectId={projectId}
          phaseId={phaseId}
          customFieldIds={summary.data.attributes.custom_field_ids}
        />
        <Box
          display="flex"
          gap="16px"
          alignItems="center"
          justifyContent="flex-end"
          pt="8px"
        >
          <IconButton
            iconName="filter-2"
            onClick={handleRestoreFilters}
            iconColor={colors.textPrimary}
            iconColorOnHover={colors.textSecondary}
            iconWidth="20px"
            iconHeight="20px"
            a11y_buttonActionMessage={formatMessage(messages.restoreFilters)}
          />
          <IconButton
            iconName={isCopied ? 'check' : 'copy'}
            iconColor={colors.textPrimary}
            iconColorOnHover={colors.textSecondary}
            iconWidth="20px"
            iconHeight="20px"
            a11y_buttonActionMessage={'Copy summary to clipboard'}
            onClick={() => {
              summaryText &&
                navigator.clipboard.writeText(removeRefs(summaryText));
              setIsCopied(true);
            }}
          />
          <IconTooltip
            icon="flag"
            content={<Rate insightId={insight.id} />}
            theme="light"
            iconSize="20px"
            iconColor={colors.textPrimary}
            placement="top"
          />
          <IconButton
            iconName="delete"
            onClick={() => handleSummaryDelete(insight.id)}
            iconColor={colors.textPrimary}
            iconColorOnHover={colors.textSecondary}
            iconWidth="20px"
            iconHeight="20px"
            a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Summary;
