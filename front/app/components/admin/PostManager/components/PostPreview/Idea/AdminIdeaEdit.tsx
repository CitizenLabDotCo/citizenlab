import React, { Suspense } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { useTheme } from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { Top } from 'components/admin/PostManager/components/PostPreview';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const IdeationForm = React.lazy(
  () => import('components/CustomFieldsForm/IdeationForm')
);

const AdminIdeaEdit = ({
  ideaId,
  goBack,
}: {
  ideaId: string;
  goBack: () => void;
}) => {
  const { phaseId: phaseIdFromUrl } = useParams() as { phaseId?: string };
  const theme = useTheme();
  const { data: idea } = useIdeaById(ideaId);

  // Use URL phaseId if available, otherwise get from idea's phases
  const phaseId = phaseIdFromUrl || idea?.data.relationships.phases.data[0]?.id;
  const { data: phase } = usePhase(phaseId);

  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );

  if (!idea || !project) return null;

  return (
    <Box border="1px solid white" borderRadius={theme.borderRadius}>
      <Top>
        <Button onClick={goBack}>
          <FormattedMessage {...messages.cancelEdit} />
        </Button>
      </Top>

      <Box className="idea-form">
        <Suspense>
          <IdeationForm
            projectId={project.data.id}
            phaseId={phaseId}
            participationMethod={phase?.data.attributes.participation_method}
            idea={idea.data}
            goBack={goBack}
          />
        </Suspense>
      </Box>
    </Box>
  );
};

export default AdminIdeaEdit;
