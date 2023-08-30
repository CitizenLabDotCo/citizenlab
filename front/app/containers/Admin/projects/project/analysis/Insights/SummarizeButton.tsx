import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';
import { ISummaryPreCheck } from 'api/analysis_summary_pre_check/types';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';

const SummarizeButton = () => {
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
    <Box>
      <Button
        justify="left"
        icon="flash"
        mb="4px"
        size="s"
        w="100%"
        buttonStyle="secondary-outlined"
        onClick={handleSummaryCreate}
        disabled={!summaryPossible}
        processing={isLoadingPreCheck || isLoadingSummary}
        whiteSpace="wrap"
      >
        Auto-summarize
        <br />
        <Text fontSize="s" m="0" color="grey600">
          {summaryPossible && summaryAccuracy && (
            <>{summaryAccuracy * 100}% accuracy</>
          )}
          {!summaryPossible && `Too many inputs`}
        </Text>
      </Button>
    </Box>
  );
};

export default SummarizeButton;
