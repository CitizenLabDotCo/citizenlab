import React, { useEffect, useState } from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import { ISummaryPreCheck } from 'api/analysis_summary_pre_check/types';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';

import useFeatureFlag from 'hooks/useFeatureFlag';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';

const SummarizeButton = () => {
  const largeSummariesEnabled = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });
  const { formatMessage } = useIntl();

  const { mutate: addSummary, isLoading: isLoadingSummary } =
    useAddAnalysisSummary();
  const { mutate: addSummaryPreCheck, isLoading: isLoadingPreCheck } =
    useAddAnalysisSummaryPreCheck();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();

  const handleSummaryCreate = () => {
    addSummary(
      {
        analysisId,
        filters,
      },
      {
        onSuccess: () => {
          trackEventByName(tracks.summaryCreated.name, {
            extra: { analysisId },
          });
        },
      }
    );
  };

  const { data: inputs } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const inputsCount = inputs?.pages[0].meta.filtered_count || 0;

  const [preCheck, setPreCheck] = useState<ISummaryPreCheck | null>(null);
  useEffect(() => {
    addSummaryPreCheck(
      { analysisId, filters },
      {
        onSuccess: (preCheck) => {
          setPreCheck(preCheck);
        },
      }
    );
  }, [analysisId, filters, addSummaryPreCheck]);

  const tooManyInputs =
    preCheck?.data.attributes.impossible_reason === 'too_many_inputs';

  const applyInputsLimit = !largeSummariesEnabled && inputsCount > 30;

  const summaryPossible =
    !tooManyInputs && !applyInputsLimit && inputsCount > 0;

  const tooltipContent = applyInputsLimit
    ? formatMessage(messages.tooltipTextLimit)
    : tooManyInputs
    ? formatMessage(messages.tooManyInputs)
    : undefined;

  return (
    <Tooltip
      content={<p>{tooltipContent}</p>}
      placement="auto-start"
      zIndex={99999}
      disabled={!tooltipContent}
    >
      <Box h="100%">
        <Button
          icon="stars"
          mb="4px"
          size="s"
          w="100%"
          h="100%"
          buttonStyle="admin-dark"
          onClick={handleSummaryCreate}
          disabled={!summaryPossible}
          processing={isLoadingPreCheck || isLoadingSummary}
          whiteSpace="wrap"
        >
          {formatMessage(messages.summarize)}
        </Button>
      </Box>
    </Tooltip>
  );
};

export default SummarizeButton;
