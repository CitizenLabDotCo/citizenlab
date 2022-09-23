import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';
import Poll from '../shared/poll';

// hooks
import usePhase from 'hooks/usePhase';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { FormattedMessage } from 'react-intl';

// styling
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

const PollContainer = memo<Props>(({ projectId, phaseId, className }) => {
  const phase = usePhase(phaseId);

  if (
    !isNilOrError(phase) &&
    phase.attributes.participation_method === 'poll'
  ) {
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
