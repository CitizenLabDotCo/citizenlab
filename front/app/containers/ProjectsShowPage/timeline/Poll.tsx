import React, { memo } from 'react';

import { H2 } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';

import messages from 'containers/ProjectsShowPage/messages';

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
        <H2 m="0">
          <FormattedMessage {...messages.navPoll} />
        </H2>
        <Poll phaseId={phaseId} projectId={projectId} />
      </Container>
    );
  }

  return null;
});

export default PollContainer;
