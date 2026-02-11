import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import AllCauses from './AllCauses';
import ExportVolunteersButton from './ExportVolunteersButton';
import messages from './messages';

const PhaseContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const AdminProjectVolunteering = () => {
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/volunteering',
  });
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
