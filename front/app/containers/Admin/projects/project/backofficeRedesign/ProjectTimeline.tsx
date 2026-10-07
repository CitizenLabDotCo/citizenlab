import React, { useState } from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';

import projectPageMessages from 'containers/Admin/projects/project/projectPage/messages';
import SpotlightSurveys from 'containers/Admin/projects/project/projectPage/SpotlightSurveys';
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
  const { data: phases } = usePhases(projectId);
  const hasPhases = !!phases && phases.data.length > 0;

  return (
    <Box pt="16px" pb="24px" px="12px">
      <Box className="intercom-product-tour-project-timeline">
        <TimelinePhases
          projectId={projectId}
          variant="backofficeRedesign"
          heading={
            <Box
              display="flex"
              alignItems="center"
              h="32px"
              px="12px"
              mb="16px"
            >
              <Box as="h4" m="0">
                <Text as="span" variant="boSection" m="0">
                  {formatMessage(
                    hasPhases
                      ? projectPageMessages.timeline
                      : messages.participationMethods
                  )}
                </Text>
              </Box>
            </Box>
          }
          onNewPhase={() => setMethodModalOpened(true)}
          withPhaseOptions
        />
      </Box>
      <SpotlightSurveys
        projectId={projectId}
        variant="backofficeRedesign"
        withPhaseOptions
      />
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
