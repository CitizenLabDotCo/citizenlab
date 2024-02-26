import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { IInsightData } from 'api/analysis_insights/types';

import {
  Box,
  IconButton,
  colors,
  stylingConsts,
  Button,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useAnalysisSummary from 'api/analysis_summaries/useAnalysisSummary';
import useDeleteAnalysisInsight from 'api/analysis_insights/useDeleteAnalysisInsight';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import Rate from './Rate';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';

import { removeRefs } from './util';
import InsightBody from './InsightBody';
import InsightFooter from './InsightFooter';

type Props = {
  insight: IInsightData;
};

const Summary = ({ insight }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatMessage } = useIntl();
  const { analysisId, projectId } = useParams() as {
    analysisId: string;
    projectId: string;
  };
  const { mutate: deleteSummary } = useDeleteAnalysisInsight();
  const { data: summary } = useAnalysisSummary({
    analysisId,
    id: insight.relationships.insightable.data.id,
  });

  const handleSummaryDelete = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteSummaryConfirmation))) {
      deleteSummary(
        {
          analysisId,
          id,
        },
        {
          onSuccess: () => {
            trackEventByName(tracks.summaryDeleted.name, {
              extra: { analysisId },
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
      bgColor={colors.teal100}
      p="24px"
      pt="48px"
      mb="8px"
      borderRadius={stylingConsts.borderRadius}
      position="relative"
    >
      <Box position="absolute" top="16px" right="8px">
        <IconButton
          iconName={isCopied ? 'check' : 'copy'}
          iconColor={colors.teal400}
          iconColorOnHover={colors.teal700}
          a11y_buttonActionMessage={'Copy summary to clipboard'}
          onClick={() => {
            summaryText &&
              navigator.clipboard.writeText(removeRefs(summaryText));
            setIsCopied(true);
          }}
        />
      </Box>
      <Box>
        <InsightBody
          text={summaryText}
          filters={summary.data.attributes.filters}
          analysisId={analysisId}
          projectId={projectId}
          phaseId={phaseId}
          backgroundTaskId={summary.data.relationships.background_task.data.id}
        />
        <InsightFooter
          filters={summary.data.attributes.filters}
          generatedAt={summary.data.attributes.created_at}
          analysisId={analysisId}
        />
      </Box>

      <Box
        display="flex"
        gap="4px"
        alignItems="center"
        justifyContent="space-between"
        mt="16px"
      >
        <Button buttonStyle="white" onClick={handleRestoreFilters} p="4px 12px">
          {formatMessage(messages.restoreFilters)}
        </Button>
        <Box display="flex">
          <IconButton
            iconName="delete"
            onClick={() => handleSummaryDelete(insight.id)}
            iconColor={colors.teal400}
            iconColorOnHover={colors.teal700}
            a11y_buttonActionMessage={formatMessage(messages.deleteSummary)}
          />
          <IconTooltip
            icon="flag"
            content={<Rate insightId={insight.id} />}
            theme="light"
            iconSize="24px"
            iconColor={colors.teal400}
            placement="left-end"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Summary;
