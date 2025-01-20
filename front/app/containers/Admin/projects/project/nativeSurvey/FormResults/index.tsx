import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import useFormResults from 'api/survey_results/useSurveyResults';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import FormResultsQuestion from './FormResultsQuestion';
import FormResultsPage from './FormResultsPage';
import ViewSingleSubmissionNotice from './FormResultsQuestion/components/ViewSingleSubmissionNotice';

const FormResults = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const [filterLogicIds, setFilterLogicIds] = useState(
    [] as string[] // Array of page or option ids to pass to the API
  );
  const { data: formResults, isLoading: isLoadingResults } = useFormResults({
    phaseId,
    filterLogicIds,
  });

  if (!formResults || !project) {
    return null;
  }

  const toggleLogicIds = (logicId: string) => {
    if (filterLogicIds.includes(logicId)) {
      setFilterLogicIds(filterLogicIds.filter((id) => id !== logicId));
    } else {
      setFilterLogicIds([...filterLogicIds, logicId]);
    }
  };

  const { totalSubmissions, results } = formResults.data.attributes;

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses);

  // If a text question exists, we use it to show the notice to view
  // individual submissions in the AI analysis view.
  const firstTextQuestion = results.find(
    (result) =>
      result.inputType === 'text' || result.inputType === 'multiline_text'
  );

  const logicConfig = {
    toggleLogicIds: toggleLogicIds,
    filterLogicIds: filterLogicIds,
    isLoading: isLoadingResults,
  };

  return (
    <Box width="100%">
      <Box width="100%">
        <Text variant="bodyM" color="textSecondary">
          {surveyResponseMessage}
        </Text>
      </Box>
      {firstTextQuestion?.customFieldId && (
        <ViewSingleSubmissionNotice
          customFieldId={firstTextQuestion.customFieldId}
        />
      )}
      <Box mt="24px">
        {totalSubmissions > 0 &&
          results.map((result, index) => {
            if (result.inputType == 'page') {
              return (
                <FormResultsPage
                  key={index}
                  result={result}
                  totalSubmissions={totalSubmissions}
                  logicConfig={logicConfig}
                />
              );
            } else {
              return (
                <FormResultsQuestion
                  key={index}
                  result={result}
                  totalSubmissions={totalSubmissions}
                  logicConfig={logicConfig}
                />
              );
            }
          })}
      </Box>
    </Box>
  );
};

export default FormResults;
