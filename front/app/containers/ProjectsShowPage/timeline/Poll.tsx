import React, { memo } from 'react';

// components
import Poll from '../shared/poll';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

// hooks
import usePhase from 'api/phases/usePhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// styling
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

const PollContainer = memo<Props>(({ projectId, phaseId, className }) => {
  const { data: phase } = usePhase(phaseId);

  if (phase && phase.data.attributes.participation_method === 'poll') {
    return (
      <Container
        className={`e2e-timeline-project-poll-container ${className || ''}`}
      >
        <ProjectPageSectionTitle>
          <FormattedMessage {...messages.navPoll} />
        </ProjectPageSectionTitle>
        <Poll phaseId={phaseId} projectId={projectId} type="phase" />
      </Container>
    );
  }

  return null;
});

export default PollContainer;
