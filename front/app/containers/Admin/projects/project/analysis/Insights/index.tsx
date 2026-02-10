import React, { useState } from 'react';

import {
  Box,
  Divider,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';

import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import DisclaimerBanner from './DisclaimerBanner';
import AnalysisFileUploader from './Files/AnalysisFileUploader';
import FileSelectionView from './Files/FileSelectionView';
import messages from './messages';
import Question from './Question';
import QuestionButton from './QuestionButton';
import QuestionInput from './QuestionInput';
import SummarizeButton from './SummarizeButton';
import Summary from './Summary';

const Insights = () => {
  const { formatMessage } = useIntl();
  const [isQuestionInputOpen, setIsQuestionInputOpen] = useState(false);
  const [isFileSelectionOpen, setIsFileSelectionOpen] = useState(false);
  const { analysisId } = useParams({ strict: false }) as { analysisId: string };
  const { data: insights, isLoading } = useAnalysisInsights({
    analysisId,
  });

  const largeSummariesAllowed = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  const isDataRepositoryAnalysisEnabled = useFeatureFlag({
    name: 'data_repository_ai_analysis',
  });

  const filters = useAnalysisFilterParams();

  const { data: allInputs } = useInfiniteAnalysisInputs({
    analysisId,
  });

  const { data: filteredInputs } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const inputsCount = allInputs?.pages[0].meta.filtered_count || 0;
  const filteredInputsCount = filteredInputs?.pages[0].meta.filtered_count || 0;
  const applyInputsLimit = !largeSummariesAllowed && filteredInputsCount > 30;

  if (isFileSelectionOpen) {
    return (
      <FileSelectionView
        setIsFileSelectionOpen={setIsFileSelectionOpen}
        analysisId={analysisId}
      />
    );
  }
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box display="flex" flexDirection="column" gap="8px">
        <Box display="flex" gap="4px">
          <Box flex="1">
            <SummarizeButton
              applyInputsLimit={applyInputsLimit}
              inputsCount={filteredInputsCount}
              analysisId={analysisId}
            />
          </Box>
          <Box flex="1">
            <QuestionButton
              onClick={() => setIsQuestionInputOpen(!isQuestionInputOpen)}
            />
          </Box>
        </Box>

        <DisclaimerBanner />

        {isQuestionInputOpen && (
          <QuestionInput onClose={() => setIsQuestionInputOpen(false)} />
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          height="40px"
          pb="8px"
          gap="4px"
        >
          <Box>
            {applyInputsLimit && (
              <Icon name="alert-circle" fill={colors.orange500} />
            )}

            <Text
              fontSize="s"
              m="0"
              variant="bodyXs"
              color={applyInputsLimit ? 'orange500' : 'textSecondary'}
            >
              {`${filteredInputsCount} / ${inputsCount}`}{' '}
              {formatMessage(messages.inputsSelected)}
            </Text>
          </Box>

          {isDataRepositoryAnalysisEnabled && (
            <AnalysisFileUploader
              setIsFileSelectionOpen={setIsFileSelectionOpen}
              analysisId={analysisId}
            />
          )}
        </Box>
      </Box>
      <Divider m="0px" />
      <Box flex="1" overflow="auto">
        {insights?.data.map((insight, index) => (
          <div key={insight.id}>
            {index > 0 && <Divider m="0px" />}
            {insight.relationships.insightable.data.type === 'summary' ? (
              <Summary insight={insight} />
            ) : (
              <Question insight={insight} />
            )}
          </div>
        ))}
        {!isLoading && insights?.data.length === 0 && (
          <>
            <Text px="24px" color="grey600">
              {formatMessage(messages.emptyList)}
            </Text>
            <Text px="24px" color="grey600">
              {formatMessage(messages.emptyListDescription)}
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Insights;
