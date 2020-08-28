import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import Poll from './poll';
import { ScreenReaderOnly } from 'utils/a11y';

// hooks
import useProject from 'hooks/useProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 60px;
  padding-bottom: 80px;
  background: ${colors.background};
  border-top: solid 1px #e8e8e8;
  border-bottom: solid 1px #e8e8e8;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectPoll = memo<Props>(({ projectId, className }) => {
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
          <ScreenReaderOnly>
            <FormattedMessage tagName="h2" {...messages.invisibleTitlePoll} />
          </ScreenReaderOnly>
          <Poll type="project" projectId={project.id} phaseId={null} />
        </StyledContentContainer>
      </Container>
    );
  }

  return null;
});

export default ProjectPoll;
