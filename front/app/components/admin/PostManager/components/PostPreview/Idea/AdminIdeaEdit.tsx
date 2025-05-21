import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { useTheme } from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';

import { Top } from 'components/admin/PostManager/components/PostPreview';
import CustomFieldsForm from 'components/CustomFieldsForm';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const AdminIdeaEdit = ({
  ideaId,
  goBack,
}: {
  ideaId: string;
  goBack: () => void;
}) => {
  const { phaseId } = useParams() as { phaseId: string };
  const theme = useTheme();
  const { data: idea } = useIdeaById(ideaId);

  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );

  if (!idea || !project) return null;

  return (
    <Box
      border="1px solid white"
      borderRadius={theme.borderRadius}
      height="100%"
      background={theme.colors.background}
    >
      <Top>
        <Button onClick={goBack}>
          <FormattedMessage {...messages.cancelEdit} />
        </Button>
      </Top>

      <Box className="idea-form">
        <CustomFieldsForm
          projectId={project.data.id}
          phaseId={phaseId}
          participationMethod={'ideation'}
          initialFormData={idea.data.attributes}
        />
      </Box>
    </Box>
  );
};

export default AdminIdeaEdit;
