import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { useParams, useSearchParams } from 'react-router-dom';

// Hooks
import useLocale from 'hooks/useLocale';

// components
import {
  Box,
  Title,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import AnalysisBanner from './AnalysisBanner';

// i18n
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useFormResults from 'hooks/useFormResults';
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';

// Services
import { downloadSurveyResults } from 'services/formCustomFields';
import FormResultsQuestion from './FormResultsQuestion';
import useFeatureFlag from 'hooks/useFeatureFlag';

const FormResults = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const [isDownloading, setIsDownloading] = useState(false);
  const locale = useLocale();
  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id');
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const formResults = useFormResults({
    projectId,
    phaseId,
  });

  const analysisEnabled = useFeatureFlag({ name: 'analysis' });

  if (isNilOrError(formResults) || isNilOrError(locale) || !project) {
    return null;
  }

  const { totalSubmissions, results } = formResults;

  const handleDownloadResults = async () => {
    try {
      setIsDownloading(true);
      await downloadSurveyResults(project.data, locale, phase?.data);
    } catch (error) {
      // Not handling errors for now
    } finally {
      setIsDownloading(false);
    }
  };

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses2, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses2);

  return (
    <Box width="100%">
      <Box width="100%" display="flex" alignItems="center">
        <Box width="100%">
          <Title variant="h2">{formatMessage(messages.surveyResults2)}</Title>
          <Text variant="bodyM" color="textSecondary">
            {surveyResponseMessage}
          </Text>
        </Box>
        <Box>
          <Button
            icon="download"
            data-cy="e2e-download-survey-results"
            buttonStyle="secondary"
            width="auto"
            minWidth="312px"
            onClick={handleDownloadResults}
            processing={isDownloading}
          >
            {formatMessage(messages.downloadResults2)}
          </Button>
        </Box>
      </Box>

      {analysisEnabled ? (
        <AnalysisBanner />
      ) : (
        <Box
          bgColor={colors.teal100}
          borderRadius="3px"
          px="12px"
          py="4px"
          mt="0px"
          mb="32px"
          role="alert"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box display="flex" gap="16px" alignItems="center">
            <Icon
              name="info-outline"
              width="24px"
              height="24px"
              fill="textSecondary"
            />
            <Text variant="bodyM" color="textSecondary">
              {formatMessage(messages.informationText2)}
            </Text>
          </Box>
        </Box>
      )}

      <Box maxWidth="524px">
        {results.map(
          (
            {
              question,
              inputType,
              answers,
              totalResponses,
              required,
              customFieldId,
            },
            index
          ) => {
            return (
              <FormResultsQuestion
                key={index}
                locale={locale}
                question={question}
                inputType={inputType}
                answers={answers}
                totalResponses={totalResponses}
                required={required}
                customFieldId={customFieldId}
              />
            );
          }
        )}
      </Box>
    </Box>
  );
};

export default injectIntl(FormResults);
