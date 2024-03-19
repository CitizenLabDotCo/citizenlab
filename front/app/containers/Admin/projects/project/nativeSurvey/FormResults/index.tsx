import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import useFormResults from 'api/survey_results/useSurveyResults';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import FormResultsQuestion from './FormResultsQuestion';

const FormResults = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: project } = useProjectById(projectId);
  const { data: formResults } = useFormResults({
    phaseId,
  });

  if (isNilOrError(formResults) || isNilOrError(locale) || !project) {
    return null;
  }

  const { totalSubmissions, results } = formResults.data.attributes;

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses);

  return (
    <Box width="100%">
      <Box width="100%">
        <Text variant="bodyM" color="textSecondary">
          {surveyResponseMessage}
        </Text>
      </Box>
      <Box>
        {totalSubmissions > 0 &&
          results.map(
            (
              {
                question,
                inputType,
                answers,
                totalResponseCount,
                questionResponseCount,
                required,
                customFieldId,
                mapConfigId,
                textResponses,
                files,
                multilocs,
                pointResponses,
              },
              index
            ) => {
              return (
                <FormResultsQuestion
                  key={index}
                  questionNumber={index + 1}
                  locale={locale}
                  question={question}
                  inputType={inputType}
                  answers={answers}
                  totalResponseCount={totalResponseCount}
                  questionResponseCount={questionResponseCount}
                  totalSubmissions={totalSubmissions}
                  required={required}
                  mapConfigId={mapConfigId}
                  customFieldId={customFieldId}
                  textResponses={textResponses}
                  pointResponses={pointResponses}
                  files={files}
                  multilocs={multilocs}
                />
              );
            }
          )}
      </Box>
    </Box>
  );
};

export default FormResults;
