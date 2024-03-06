import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import useAnalyses from 'api/analyses/useAnalyses';

import { useIntl } from 'utils/cl-intl';

import Insights from './Insights';
import messages from './messages';

const Analyses = ({
  projectId,
  phaseId,
  questionId,
  selectedLocale,
}: {
  projectId?: string;
  phaseId?: string;
  questionId?: string;
  selectedLocale: string;
}) => {
  const { formatMessage } = useIntl();
  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  const relevantAnalyses = questionId
    ? analyses?.data.filter(
        (analysis) =>
          analysis.relationships.main_custom_field?.data.id === questionId
      )
    : analyses?.data;

  if (relevantAnalyses?.length === 0) {
    return <Text>{formatMessage(messages.noInsights)}</Text>;
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
