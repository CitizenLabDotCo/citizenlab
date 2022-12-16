import { Box, Text } from '@citizenlab/cl2-component-library';
import React from 'react';
import formBuilderMessages from '../../../../../formBuilder/components/messages';
import messages from './messages';
import useLocale from '../../../../../../../hooks/useLocale';
import useProject from '../../../../../../../hooks/useProject';
import useFormResults from '../../../../../../../hooks/useFormResults';
import { isNilOrError } from '../../../../../../../utils/helperUtils';
import { useIntl } from '../../../../../../../utils/cl-intl';
import FormResultsQuestion from '../../../../../formBuilder/components/FormResults/FormResultsQuestion';

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
    isNilOrError(project)
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

  return (
    <>
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Text variant="bodyM" color="textSecondary">
          {surveyResponseMessage}
        </Text>
      </Box>
      <Box width="100%" display="flex">
        {results.map(
          (
            { question, inputType, answers, totalResponses, required },
            index
          ) => {
            if (!showQuestions.includes(index)) {
              return null;
            }
            return (
              <Box p="10px" width="50%" key={index} border="1px solid #ccc">
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
    </>
  );
};

export default SurveyResultsReport;
