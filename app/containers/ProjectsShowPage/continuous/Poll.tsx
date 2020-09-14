import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import Poll from '../shared/poll';
import { ScreenReaderOnly } from 'utils/a11y';
import { SectionContainer } from 'containers/ProjectsShowPage/styles';

// hooks
import useProject from 'hooks/useProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// styling
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const StyledContentContainer = styled(ContentContainer)``;

interface Props {
  projectId: string;
  className?: string;
}

const PollContainer = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });

  if (
    !isNilOrError(project) &&
    project.attributes.process_type === 'continuous' &&
    project.attributes.participation_method === 'poll'
  ) {
    return (
      <Container
        id="e2e-continuous-project-poll-container"
        className={className || ''}
      >
        <StyledContentContainer>
          <SectionContainer>
            <ScreenReaderOnly>
              <FormattedMessage tagName="h2" {...messages.invisibleTitlePoll} />
            </ScreenReaderOnly>
            <Poll type="project" projectId={project.id} phaseId={null} />
          </SectionContainer>
        </StyledContentContainer>
      </Container>
    );
  }

  return null;
});

export default PollContainer;
