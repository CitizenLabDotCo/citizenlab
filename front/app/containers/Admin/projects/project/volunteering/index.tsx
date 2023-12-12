// Libraries
import React from 'react';
import styled from 'styled-components';
import useProjectById from 'api/projects/useProjectById';

// Components
import ExportVolunteersButton from './ExportVolunteersButton';
import AllCauses from './AllCauses';
import { SectionDescription } from 'components/admin/Section';
import { Box, Title } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';

// hooks
import usePhase from 'api/phases/usePhase';

const PhaseContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const AdminProjectVolunteering = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  if (!project) return null;

  if (!phase || phase.data.attributes.participation_method !== 'volunteering') {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Title variant="h3" color="primary">
          <FormattedMessage {...messages.titleVolunteeringTab} />
        </Title>
        <ExportVolunteersButton phaseId={phaseId} />
      </Box>

      <SectionDescription>
        <FormattedMessage {...messages.subtitleVolunteeringTab} />
      </SectionDescription>
      <PhaseContainer key={phase.data.id}>
        <AllCauses projectId={project.data.id} phaseId={phaseId} />
      </PhaseContainer>
    </Box>
  );
};

export default AdminProjectVolunteering;
