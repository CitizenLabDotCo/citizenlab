import React from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useAnalyses from 'api/analyses/useAnalyses';
import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import Insights from './Insights';
import messages from './messages';

const Analyses = ({
  projectId,
  selectedLocale,
  phaseId,
  participationMethod,
}: {
  projectId?: string;
  selectedLocale: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;
}) => {
  const { formatMessage } = useIntl();
  const phaseInsightsEnabled = useFeatureFlag({ name: 'phase_insights' });
  const { data: analyses, isLoading } = useAnalyses({
    projectId: participationMethod === 'ideation' ? projectId : undefined,
    phaseId: participationMethod === 'native_survey' ? phaseId : undefined,
  });

  // When phase_insights is disabled, use 'results' for native surveys
  const nativeSurveyTab =
    participationMethod === 'native_survey' && !phaseInsightsEnabled
      ? 'results'
      : 'insights';

  const projectLink: RouteType =
    participationMethod === 'ideation'
      ? `/admin/projects/${projectId}/phases/${phaseId}/ideas`
      : `/admin/projects/${projectId}/phases/${phaseId}/${nativeSurveyTab}`;

  // Analyses related to specific survey questions are now handled in the Survey Question Widget
  const analysesWithoutMainCustomField = analyses?.data.filter(
    (analysis) => analysis.relationships.main_custom_field?.data === null
  );

  if (analysesWithoutMainCustomField?.length === 0 && !isLoading) {
    return (
      <Box id="e2e-report-buider-ai-no-analyses">
        <Divider />
        <Text>{formatMessage(messages.noInsights)}</Text>
        <Box display="flex">
          <ButtonWithLink
            linkTo={projectLink}
            buttonStyle="secondary-outlined"
            openLinkInNewTab
          >
            {formatMessage(messages.openProject)}
          </ButtonWithLink>
        </Box>
      </Box>
    );
  }

  return (
    <div>
      {projectId &&
        analysesWithoutMainCustomField &&
        analysesWithoutMainCustomField.length > 0 && (
          <Box mb="16px">
            <Warning>
              <Text p="0px" m="0px" fontSize="s" color="teal700">
                {formatMessage(messages.dragAiContentInfo)}
              </Text>
            </Warning>
          </Box>
        )}
      {projectId &&
        analysesWithoutMainCustomField?.map((analysis) => (
          <Insights
            analysisId={analysis.id}
            key={analysis.id}
            projectId={projectId}
            phaseId={phaseId}
            selectedLocale={selectedLocale}
          />
        ))}
    </div>
  );
};

export default Analyses;
