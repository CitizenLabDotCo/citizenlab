import useAnalyses from 'api/analyses/useAnalyses';
import React from 'react';
import Insights from './Insights';

const Analyses = ({
  projectId,
  phaseId,
  questionId,
  selectedLocale,
}: {
  projectId: string;
  phaseId?: string;
  questionId?: string;
  selectedLocale: string;
}) => {
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

  return (
    <div>
      {relevantAnalyses?.map((analysis) => (
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
