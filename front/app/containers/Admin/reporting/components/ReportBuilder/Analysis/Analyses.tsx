import useAnalyses from 'api/analyses/useAnalyses';
import React from 'react';
import Insights from './Insights';

const Analyses = ({
  projectId,
  phaseId,
  questionId,
}: {
  projectId: string;
  phaseId?: string;
  questionId?: string;
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
        />
      ))}
    </div>
  );
};

export default Analyses;
