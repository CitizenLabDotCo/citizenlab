import React from 'react';
import useAnalyses from 'api/analyses/useAnalyses';
import useDeleteAnalysis from 'api/analyses/useDeleteAnalysis';
import { useParams, useSearchParams } from 'react-router-dom';
import { ListItem, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const AnalysesList = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  const { mutate: deleteAnalysis } = useDeleteAnalysis();

  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id') || undefined;
  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  return (
    <div>
      {analyses?.data.map((analysis) => {
        return (
          <ListItem
            key={analysis.id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            py="16px"
          >
            {analysis.id}
            <Box display="flex" gap="24px">
              <Button
                linkTo={`/admin/projects/${projectId}/analysis/${analysis.id}`}
                icon="eye"
                buttonStyle="secondary"
              >
                {formatMessage(messages.viewAnalysis)}
              </Button>
              <Button
                onClick={() => deleteAnalysis(analysis.id)}
                icon="delete"
                buttonStyle="secondary"
              >
                {formatMessage(messages.deleteAnalysis)}
              </Button>
            </Box>
          </ListItem>
        );
      })}
    </div>
  );
};

export default AnalysesList;
