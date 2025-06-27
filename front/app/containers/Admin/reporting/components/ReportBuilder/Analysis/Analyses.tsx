import React from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useAnalyses from 'api/analyses/useAnalyses';
import { ParticipationMethod } from 'api/phases/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Warning from 'components/UI/Warning';

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
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          analysis.relationships.main_custom_field?.data?.id === questionId
      )
    : analyses?.data;

  const hasRelevantAnalyses = relevantAnalyses && relevantAnalyses.length > 0;

  const projectLink: RouteType =
    participationMethod === 'ideation'
      ? `/admin/projects/${projectId}/phases/${phaseId}/ideas`
      : `/admin/projects/${projectId}/phases/${phaseId}/results`;

  if (relevantAnalyses?.length === 0 && !isLoading) {
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
      {phaseId && hasRelevantAnalyses && (
        <Box mb="16px">
          <Warning>
            <Text p="0px" m="0px" fontSize="s" color="teal700">
              {formatMessage(messages.dragAiContentInfo)}
            </Text>
          </Warning>
        </Box>
      )}

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
