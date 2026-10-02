import React, { useState } from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import TimelinePhases from 'containers/Admin/projects/project/projectPage/TimelinePhases';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SelectMethodModal from './ProjectSetupPanel/SelectMethodModal';
import TimelineEvents from './TimelineEvents';

interface Props {
  projectId: string;
}

const ProjectTimeline = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const [methodModalOpened, setMethodModalOpened] = useState(false);

  return (
    <Box py="24px" px="16px">
      <Box className="intercom-product-tour-project-timeline">
        <TimelinePhases
          projectId={projectId}
          heading={
            <Box px="8px" mb="12px">
              <Title variant="h4" fontSize="s" fontWeight="semi-bold" m="0">
                {formatMessage(messages.participationMethods)}
              </Title>
            </Box>
          }
          onNewPhase={() => setMethodModalOpened(true)}
          withPhaseOptions
        />
      </Box>
      <Box mx="8px" my="24px" borderTop={`1px solid ${colors.grey200}`} />
      <TimelineEvents projectId={projectId} />
      <SelectMethodModal
        projectId={projectId}
        opened={methodModalOpened}
        onClose={() => setMethodModalOpened(false)}
      />
    </Box>
  );
};

export default ProjectTimeline;
