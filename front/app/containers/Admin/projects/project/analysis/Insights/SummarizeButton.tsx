import React, { useEffect, useState } from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';

import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import { ISummaryPreCheck } from 'api/analysis_summary_pre_check/types';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';

const SummarizeButton = ({
  applyInputsLimit,
  inputsCount,
  analysisId,
}: {
  applyInputsLimit: boolean;
  inputsCount: number;
  analysisId: string;
}) => {
  const { formatMessage } = useIntl();
  const { mutate: addSummary, isLoading: isLoadingSummary } =
    useAddAnalysisSummary();
  const { mutate: addSummaryPreCheck, isLoading: isLoadingPreCheck } =
    useAddAnalysisSummaryPreCheck();
  const filters = useAnalysisFilterParams();

  const handleSummaryCreate = () => {
    addSummary(
      {
        analysisId,
        filters,
      },
      {
        onSuccess: () => {
          trackEventByName(tracks.summaryCreated, {
            analysisId,
          });
        },
      }
    );
  };

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
