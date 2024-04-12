import React, { memo } from 'react';

import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';

import messages from 'containers/ProjectsShowPage/messages';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

import { FormattedMessage } from 'utils/cl-intl';

import Poll from '../shared/poll';

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
