import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import FormResultsPage from './FormResultsPage';
import FormResultsQuestion from './FormResultsQuestion';
import messages from './messages';
import useSurveyResultsData from './useSurveyResultsData';

type Props = {
  projectId?: string;
  phaseId?: string;
};

const FormResults = ({ projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const { results, totalSubmissions, logicConfig, isReady } =
    useSurveyResultsData({ projectId, phaseId });

  if (!isReady) {
    return null;
  }

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses);

  return (
    <Box width="100%">
      <Title variant="h3" as="h2" color="textPrimary" m="0px" mb="16px">
        {formatMessage(messages.questions)}
      </Title>
      <Text variant="bodyM" color="textSecondary">
        {surveyResponseMessage}
      </Text>
      <Box mt="24px">
        {totalSubmissions > 0 &&
          results.map((result, index) => {
            const exportId = `survey-results-item-${index}`;
            if (result.inputType === 'page') {
              return (
                <FormResultsPage
                  key={index}
                  result={result}
                  totalSubmissions={totalSubmissions}
                  logicConfig={logicConfig}
                  exportId={exportId}
                />
              );
            } else {
              return (
                <FormResultsQuestion
                  key={index}
                  result={result}
                  totalSubmissions={totalSubmissions}
                  logicConfig={logicConfig}
                  isPdfExport={false}
                  exportId={exportId}
                />
              );
            }
          })}
      </Box>
    </Box>
  );
};

export default FormResults;
