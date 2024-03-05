import { Box } from '@citizenlab/cl2-component-library';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import React from 'react';
import Question from './Question';
import Summary from './Summary';

const Insights = ({
  analysisId,
  projectId,
  phaseId,
}: {
  analysisId: string;
  projectId: string;
  phaseId?: string;
}) => {
  const { data: insights } = useAnalysisInsights({
    analysisId,
  });

  return (
    <div>
      {insights?.data.map((insight) => (
        <Box key={insight.id}>
          {insight.relationships.insightable.data.type ===
          'analysis_question' ? (
            <Question
              key={insight.relationships.insightable.data.id}
              questionId={insight.relationships.insightable.data.id}
              analysisId={analysisId}
              projectId={projectId}
              phaseId={phaseId}
            />
          ) : (
            <Summary
              key={insight.relationships.insightable.data.id}
              summaryId={insight.relationships.insightable.data.id}
              analysisId={analysisId}
              projectId={projectId}
              phaseId={phaseId}
            />
          )}
        </Box>
      ))}
    </div>
  );
};

export default Insights;
