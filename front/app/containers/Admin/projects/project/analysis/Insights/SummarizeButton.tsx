import { Box, Button } from '@citizenlab/cl2-component-library';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';
import { ISummaryPreCheck } from 'api/analysis_summary_pre_check/types';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';

const SummarizeButton = () => {
  const { mutate: addSummary, isLoading: isLoadingSummary } =
    useAddAnalysisSummary();
  const { mutate: addSummaryPreCheck, isLoading: isLoadingPreCheck } =
    useAddAnalysisSummaryPreCheck();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();
  const { data } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const inputsCount = data?.pages[0].meta.filtered_count;

  const handleSummaryCreate = () => {
    addSummary({
      analysisId,
      filters,
    });
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

  const summaryPossible = !preCheck?.data.attributes.impossible_reason;
  const summaryAccuracy = preCheck?.data.attributes.accuracy;
  return (
    <Box display="flex" justifyContent="flex-end">
      <Button
        icon="flash"
        mb="12px"
        size="s"
        w="100%"
        buttonStyle="secondary-outlined"
        onClick={handleSummaryCreate}
        disabled={!summaryPossible}
        processing={isLoadingPreCheck || isLoadingSummary}
        whiteSpace="wrap"
      >
        {summaryPossible &&
          summaryAccuracy &&
          `Auto-summarize ${inputsCount} inputs (${
            summaryAccuracy * 100
          }% accuracy)`}
        {summaryPossible &&
          !summaryAccuracy &&
          `Auto-summarize ${inputsCount} inputs`}
        {!summaryPossible && `Too many inputs to summarize`}
      </Button>
    </Box>
  );
};

export default SummarizeButton;
