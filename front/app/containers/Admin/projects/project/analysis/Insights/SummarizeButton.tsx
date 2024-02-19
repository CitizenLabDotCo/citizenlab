import { Box, Button } from '@citizenlab/cl2-component-library';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';
import { ISummaryPreCheck } from 'api/analysis_summary_pre_check/types';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';

import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useFeatureFlag from 'hooks/useFeatureFlag';
import Tippy from '@tippyjs/react';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';

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

  const inputsCount = inputs?.pages[0].meta.filtered_count;

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

  const tooManyInputs = preCheck?.data.attributes.impossible_reason;

  const applyInputsLimit =
    !largeSummariesEnabled && inputsCount && inputsCount > 30;

  const summaryPossible = !tooManyInputs && !applyInputsLimit;
  const tooltipContent = applyInputsLimit
    ? formatMessage(messages.tooltipTextLimit)
    : formatMessage(messages.tooManyInputs);

  return (
    <Tippy
      content={<p>{tooltipContent}</p>}
      placement="auto-start"
      zIndex={99999}
      disabled={summaryPossible}
    >
      <Box>
        <Button
          justify="left"
          icon="flash"
          mb="4px"
          size="s"
          w="100%"
          buttonStyle="admin-dark"
          onClick={handleSummaryCreate}
          disabled={!summaryPossible}
          processing={isLoadingPreCheck || isLoadingSummary}
          whiteSpace="wrap"
        >
          {formatMessage(messages.summarize)}
        </Button>
      </Box>
    </Tippy>
  );
};

export default SummarizeButton;
