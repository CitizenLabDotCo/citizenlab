import { Box, Button } from '@citizenlab/cl2-component-library';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';
import { ISummaryPreCheck } from 'api/analysis_summary_pre_check/types';

type Props = {
  inputsCount?: number;
};
const SummarizeButton = ({ inputsCount }: Props) => {
  const { mutate: addSummary, isLoading: isLoadingSummary } =
    useAddAnalysisSummary();
  const { mutate: addSummaryPreCheck, isLoading: isLoadingPreCheck } =
    useAddAnalysisSummaryPreCheck();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();
  const handleSummaryCreate = () => {
    addSummary({
      analysisId,
      filters,
    });
  };

  const [preCheck, setPreCheck] = useState<ISummaryPreCheck | null>(null);
  const jsonFilters = JSON.stringify(filters);
  useEffect(() => {
    addSummaryPreCheck(
      { analysisId, filters: JSON.parse(jsonFilters) },
      {
        onSuccess: (preCheck) => {
          setPreCheck(preCheck);
        },
      }
    );
  }, [analysisId, jsonFilters, addSummaryPreCheck]);

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
      >
        {summaryPossible
          ? `Auto-summarize ${inputsCount} inputs (${summaryAccuracy} accuracy)`
          : `Too many inputs to summarize`}
      </Button>
    </Box>
  );
};

export default SummarizeButton;
