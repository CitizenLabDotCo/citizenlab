import React, { memo } from 'react';

import Poll from '../shared/poll';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  projectId: string;
  phaseId: string;
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
        <Poll phaseId={phaseId} projectId={projectId} />
      </Container>
    );
  }

  return null;
});

export default PollContainer;
