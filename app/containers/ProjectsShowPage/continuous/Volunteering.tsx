import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import Volunteering from '../shared/volunteering';
import { ScreenReaderOnly } from 'utils/a11y';
import {
  SectionContainer,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';

// hooks
import useProject from 'hooks/useProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

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
            <ScreenReaderOnly>
              <FormattedMessage tagName="h2" {...messages.invisibleTitlePoll} />
            </ScreenReaderOnly>
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
