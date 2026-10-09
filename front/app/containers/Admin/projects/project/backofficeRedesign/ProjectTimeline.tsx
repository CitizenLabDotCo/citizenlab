import React, { useState } from 'react';

import {
  Box,
  Button,
  Text,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        h="32px"
        pl="12px"
        mb="16px"
      >
        <Box as="h4" m="0">
          <Text as="span" variant="boSection" m="0">
            {formatMessage(messages.participationMethods)}
          </Text>
        </Box>
        <Tooltip
          content={formatMessage(projectPageMessages.newParticipationMethod)}
          theme="dark"
          placement="bottom"
        >
          <Button
            className="intercom-product-tour-project-timeline-new-phase"
            buttonStyle="bo-text"
            icon="plus"
            width="32px"
            height="32px"
            padding="0"
            ariaLabel={formatMessage(
              projectPageMessages.newParticipationMethod
            )}
            onClick={() => setMethodModalOpened(true)}
          />
        </Tooltip>
      </Box>
      <Box className="intercom-product-tour-project-timeline">
        <TimelinePhases
          projectId={projectId}
          variant="backofficeRedesign"
          heading={
            hasPhases && (
              <Box px="12px" mb="8px">
                <Text variant="boHelper" color="textSecondary" m="0">
                  {formatMessage(projectPageMessages.timeline)}
                </Text>
              </Box>
            )
          }
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
