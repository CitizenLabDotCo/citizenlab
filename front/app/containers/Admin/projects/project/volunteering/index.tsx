// Libraries
import React from 'react';
import styled from 'styled-components';
import useProjectById from 'api/projects/useProjectById';

// Components
import ExportVolunteersButton from './ExportVolunteersButton';
import AllCauses from './AllCauses';
import T from 'components/T';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';
import usePhases from 'api/phases/usePhases';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
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
  const { projectId } = useParams() as {
    projectId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!project) return null;

  if (
    project.data.attributes.process_type === 'continuous' &&
    project.data.attributes.participation_method === 'volunteering'
  ) {
    return (
      <Container>
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
      </Container>
    );
  }

  if (project.data.attributes.process_type === 'timeline' && phases) {
    const volunteeringPhases = phases.data.filter(
      (phase) => phase.attributes.participation_method === 'volunteering'
    );
    if (volunteeringPhases.length === 0) return null;
    return (
      <Container>
        <SectionTitle>
          <FormattedMessage {...messages.titleVolunteeringTab} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleVolunteeringTab} />
        </SectionDescription>
        {volunteeringPhases.map((phase) => (
          <PhaseContainer key={phase.id}>
            <HeaderContainer>
              <Left>
                <h3>
                  <T value={phase.attributes.title_multiloc} />
                </h3>
              </Left>
              <ExportVolunteersButton
                participationContextId={phase.id}
                participationContextType="phase"
              />
            </HeaderContainer>
            <AllCauses
              projectId={project.data.id}
              participationContextType="phase"
              participationContextId={phase.id}
            />
          </PhaseContainer>
        ))}
      </Container>
    );
  }
  return null;
};

export default AdminProjectVolunteering;
