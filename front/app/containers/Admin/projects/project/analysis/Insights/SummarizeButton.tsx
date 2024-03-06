import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAddAnalysisSummary from 'api/analysis_summaries/useAddAnalysisSummary';
import { ISummaryPreCheck } from 'api/analysis_summary_pre_check/types';
import useAddAnalysisSummaryPreCheck from 'api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl, FormattedMessage } from 'utils/cl-intl';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';

const SummarizeButton = () => {
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
        {formatMessage(messages.summarize)}
        <br />
        <Text fontSize="s" m="0" color="grey600" whiteSpace="nowrap">
          <Box display="flex" gap="4px">
            {summaryPossible && summaryAccuracy && (
              <>
                <FormattedMessage
                  {...messages.accuracy}
                  values={{
                    accuracy: summaryAccuracy * 100,
                    percentage: formatMessage(messages.percentage),
                  }}
                />
                <IconTooltip
                  icon="info-outline"
                  content={formatMessage(messages.summaryAccuracyTooltip)}
                />
              </>
            )}
            {!summaryPossible && (
              <>
                <FormattedMessage {...messages.tooManyInputs} />
                <IconTooltip
                  icon="info-solid"
                  content={formatMessage(messages.tooManyInputsTooltip)}
                />
              </>
            )}
          </Box>
        </Text>
      </Button>
    </Box>
  );
};

export default SummarizeButton;
