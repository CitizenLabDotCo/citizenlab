import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import FormResultsQuestion from 'containers/Admin/formBuilder/components/FormResults/FormResultsQuestion';

// messages
import formBuilderMessages from 'containers/Admin/formBuilder/components/messages';
import messages from './messages';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import useFormResults from 'hooks/useFormResults';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { useIntl } from 'utils/cl-intl';

// typings
import { Result } from 'services/formCustomFields';

type SurveyResultsReportProps = {
  projectId: string;
  phaseId: string | undefined;
  showQuestions?: number[];
};

const SurveyResultsReport = ({
  projectId,
  phaseId,
  showQuestions = [],
}: SurveyResultsReportProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const project = useProject({ projectId });
  const formResults = useFormResults({
    projectId,
    phaseId,
  });

  if (
    isNilOrError(formResults) ||
    isNilOrError(locale) ||
    isNilOrError(project) ||
    formResults.results.length === 0
  ) {
    return (
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Text variant="bodyM" color="textSecondary">
          {formatMessage(messages.surveyNoResults)}
        </Text>
      </Box>
    );
  }

  const { totalSubmissions, results } = formResults;

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(formBuilderMessages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(formBuilderMessages.noSurveyResponses);

  // Map into rows of two
  const mapResultRows = (results: Result[]) => {
    const displayResults: Array<Result>[] = [];
    let eachRow: Result[] = [];
    let displayIndex = 1;
    results.map((surveyResultData, index) => {
      if (showQuestions.includes(index)) {
        eachRow.push(surveyResultData);
        if (displayIndex % 2 === 0) {
          displayResults.push(eachRow);
          eachRow = [];
        }
        displayIndex++;
      }
    });
    if (eachRow.length !== 0) {
      displayResults.push(eachRow);
    }
    return displayResults;
  };

  return (
    <>
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Text variant="bodyM" color="textSecondary">
          {surveyResponseMessage}
        </Text>
      </Box>
      {mapResultRows(results).map((row, index) => {
        return (
          <Box
            px="20px"
            width="100%"
            display="flex"
            flexDirection="row"
            key={index}
          >
            {row.map(
              (
                { question, inputType, answers, totalResponses, required },
                index
              ) => {
                return (
                  <Box
                    px="20px"
                    width="50%"
                    key={index}
                    border="1px solid #ccc"
                  >
                    <FormResultsQuestion
                      locale={locale}
                      question={question}
                      inputType={inputType}
                      answers={answers}
                      totalResponses={totalResponses}
                      required={required}
                    />
                  </Box>
                );
              }
            )}
          </Box>
        );
      })}
    </>
  );
};

export default SurveyResultsReport;
