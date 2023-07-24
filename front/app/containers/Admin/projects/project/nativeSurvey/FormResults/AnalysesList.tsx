import React from 'react';
import useAnalyses from 'api/analyses/useAnalyses';
import useDeleteAnalysis from 'api/analyses/useDeleteAnalysis';
import { useParams, useSearchParams } from 'react-router-dom';
import { IconButton, ListItem } from '@citizenlab/cl2-component-library';
import clHistory from 'utils/cl-router/history';

const AnalysesList = () => {
  const { projectId } = useParams() as { projectId: string };
  const { mutate: deleteAnalysis } = useDeleteAnalysis();

  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id') || undefined;
  const { data: analyses } = useAnalyses({ projectId, phaseId });

  console.log(analyses);
  return (
    <div>
      {analyses?.data.map((analysis) => {
        return (
          <ListItem key={analysis.id}>
            {analysis.id}
            <IconButton
              iconName="eye"
              iconColor="#000"
              iconColorOnHover="blue"
              onClick={() => {
                clHistory.push(
                  `/admin/projects/${projectId}/analysis/${analysis.id}`
                );
              }}
              a11y_buttonActionMessage="View analysis"
            />

            <IconButton
              iconName="delete"
              iconColor="#000"
              iconColorOnHover="red"
              onClick={() => deleteAnalysis(analysis.id)}
              a11y_buttonActionMessage="Delete analysis"
            />
          </ListItem>
        );
      })}
    </div>
  );
};

export default AnalysesList;
