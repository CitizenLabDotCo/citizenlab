// Libraries
import React from 'react';
import styled from 'styled-components';
import useProjectById from 'api/projects/useProjectById';

// Components
import ExportVolunteersButton from './ExportVolunteersButton';
import AllCauses from './AllCauses';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
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

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const Left = styled.div`
  margin-right: 80px;
`;

const AdminProjectVolunteering = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  if (!project) return null;

  if (
    project.data.attributes.process_type === 'continuous' &&
    project.data.attributes.participation_method === 'volunteering'
  ) {
    return (
      <Box display="flex" flexDirection="column">
        <HeaderContainer>
          <Left>
            <SectionTitle>
              <FormattedMessage {...messages.titleVolunteeringTab} />
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleVolunteeringTab} />
            </SectionDescription>
          </Left>
          <ExportVolunteersButton
            participationContextType="project"
            participationContextId={project.data.id}
          />
        </HeaderContainer>
        <AllCauses
          projectId={project.data.id}
          participationContextType="project"
          participationContextId={project.data.id}
        />
      </Box>
    );
  }

  if (!phase || phase.data.attributes.participation_method !== 'volunteering') {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Title variant="h3" color="primary">
          <FormattedMessage {...messages.titleVolunteeringTab} />
        </Title>
        <ExportVolunteersButton
          participationContextId={phaseId}
          participationContextType="phase"
        />
      </Box>

      <SectionDescription>
        <FormattedMessage {...messages.subtitleVolunteeringTab} />
      </SectionDescription>
      <PhaseContainer key={phase.data.id}>
        <AllCauses
          projectId={project.data.id}
          participationContextType="phase"
          participationContextId={phaseId}
        />
      </PhaseContainer>
    </Box>
  );
};

export default AdminProjectVolunteering;
