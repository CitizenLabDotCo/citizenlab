import React, { memo } from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import messages from 'containers/ProjectsShowPage/messages';

import { FormattedMessage } from 'utils/cl-intl';

import Poll from '../shared/poll';

interface Props {
  projectId: string;
  phaseId: string;
  className?: string;
}

const PollContainer = memo<Props>(({ projectId, phaseId, className }) => (
  <Box className={`e2e-timeline-project-poll-container ${className || ''}`}>
    <Title variant="h2" mt="0" color="tenantText">
      <FormattedMessage {...messages.navPoll} />
    </Title>
    <Poll phaseId={phaseId} projectId={projectId} />
  </Box>
));

export default PollContainer;
