import React, { useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAnalyses from 'api/analyses/useAnalyses';
import { useParams } from 'react-router-dom';

import AnalysisInsights from './AnalysisInsights';
import useAddAnalysis from 'api/analyses/useAddAnalysis';

const Analysis = ({ customFieldId }: { customFieldId: string }) => {
  const { mutate: addAnalysis } = useAddAnalysis();

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  const relevantAnalysis =
    analyses?.data &&
    analyses?.data?.find((analysis) =>
      analysis.relationships.custom_fields.data.some(
        (field) => field.id === customFieldId
      )
    );

  // Create an analysis if there are no analyses yet
  useEffect(() => {
    if (analyses && customFieldId && !relevantAnalysis) {
      addAnalysis({
        projectId: phaseId ? undefined : projectId,
        phaseId,
        customFieldIds: [customFieldId],
      });
    }
  }, [
    customFieldId,
    relevantAnalysis,
    analyses,
    projectId,
    phaseId,
    addAnalysis,
  ]);

  return (
    <Box>
      {relevantAnalysis && <AnalysisInsights analysis={relevantAnalysis} />}
    </Box>
  );
};

export default Analysis;
