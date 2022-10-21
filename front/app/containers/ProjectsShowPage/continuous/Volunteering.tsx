import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import Volunteering from '../shared/volunteering';

// hooks
import useProject from 'hooks/useProject';

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
  const project = useProject({ projectId });

  if (
    !isNilOrError(project) &&
    project.attributes.process_type === 'continuous' &&
    project.attributes.participation_method === 'volunteering'
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
              projectId={project.id}
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
