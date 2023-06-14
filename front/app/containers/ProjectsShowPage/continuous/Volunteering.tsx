import React, { memo } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import Volunteering from '../shared/volunteering';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';

// hooks
import useProjectById from 'api/projects/useProjectById';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div``;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
`;

interface Props {
  projectId: string;
  className?: string;
}

const VolunteeringContainer = memo<Props>(({ projectId, className }) => {
  const { data: project } = useProjectById(projectId);

  if (
    project &&
    project.data.attributes.process_type === 'continuous' &&
    project.data.attributes.participation_method === 'volunteering'
  ) {
    return (
      <Container
        id="e2e-continuous-project-volunteering-container"
        className={className || ''}
      >
        <StyledContentContainer maxWidth={maxPageWidth}>
          <SectionContainer>
            <Volunteering
              type="project"
              projectId={project.data.id}
              phaseId={null}
            />
          </SectionContainer>
        </StyledContentContainer>
      </Container>
    );
  }

  return null;
});

export default VolunteeringContainer;
