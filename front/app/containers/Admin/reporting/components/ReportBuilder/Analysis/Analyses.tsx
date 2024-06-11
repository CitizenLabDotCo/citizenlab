import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useAnalyses from 'api/analyses/useAnalyses';
import { ParticipationMethod } from 'api/phases/types';

import Divider from 'components/admin/Divider';
import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';

import Insights from './Insights';
import messages from './messages';

const Analyses = ({
  projectId,
  phaseId,
  questionId,
  selectedLocale,
  participationMethod,
}: {
  projectId?: string;
  phaseId?: string;
  questionId?: string;
  selectedLocale: string;
  participationMethod?: ParticipationMethod;
}) => {
  const { formatMessage } = useIntl();
  const { data: analyses, isLoading } = useAnalyses({
    projectId: participationMethod === 'ideation' ? projectId : undefined,
    phaseId: participationMethod === 'native_survey' ? phaseId : undefined,
  });

  const relevantAnalyses = questionId
    ? analyses?.data.filter(
        (analysis) =>
          analysis.relationships.main_custom_field?.data?.id === questionId
      )
    : analyses?.data;

  const projectLink: RouteType =
    participationMethod === 'ideation'
      ? `/admin/projects/${projectId}/phases/${phaseId}/ideas`
      : `/admin/projects/${projectId}/phases/${phaseId}/native-survey`;

  if (relevantAnalyses?.length === 0 && !isLoading) {
    return (
      <Box id="e2e-report-buider-ai-no-analyses">
        <Divider />
        <Text>{formatMessage(messages.noInsights)}</Text>
        <Box display="flex">
          <Button
            linkTo={projectLink}
            buttonStyle="secondary-outlined"
            openLinkInNewTab
          >
            {formatMessage(messages.openProject)}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <div>
      {projectId &&
        relevantAnalyses?.map((analysis) => (
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
