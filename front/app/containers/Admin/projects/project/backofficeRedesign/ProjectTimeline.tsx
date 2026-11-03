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
import { SectionLabel } from 'containers/Admin/projects/project/projectPage/phaseRowUtils';
import SpotlightSurveys from 'containers/Admin/projects/project/projectPage/SpotlightSurveys';
import TimelinePhases from 'containers/Admin/projects/project/projectPage/TimelinePhases';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SelectMethodModal from './ProjectSetupPanel/SelectMethodModal';
import TimelineEvents from './TimelineEvents';

interface Props {
  projectId: string;
  onCollapse: () => void;
}

const ProjectTimeline = ({ projectId, onCollapse }: Props) => {
  const { formatMessage } = useIntl();
  const [methodModalOpened, setMethodModalOpened] = useState(false);
  const { data: phases } = usePhases(projectId);
  const hasPhases = !!phases && phases.data.length > 0;

  return (
    <Box pt="18px" pb="24px" px="8px">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        h="32px"
        pl="10px"
        mb="17px"
      >
        <Box as="h4" m="0">
          <Text
            as="span"
            variant="boSection"
            fontSize="xs"
            lineHeight="16px"
            m="0"
          >
            {formatMessage(messages.participation)}
          </Text>
        </Box>
        <Box display="flex" gap="4px">
          <Tooltip
            content={formatMessage(messages.hidePanel)}
            theme="dark"
            placement="bottom"
          >
            <Button
              buttonStyle="bo-text"
              icon="panel-left"
              width="32px"
              height="32px"
              padding="0"
              ariaLabel={formatMessage(messages.hidePanel)}
              onClick={onCollapse}
            />
          </Tooltip>
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
      </Box>
      <Box className="intercom-product-tour-project-timeline">
        <TimelinePhases
          projectId={projectId}
          variant="backofficeRedesign"
          heading={
            hasPhases && (
              <Box as="h4" px="10px" m="0 0 12px 0">
                <SectionLabel as="span">
                  {formatMessage(projectPageMessages.timeline)}
                </SectionLabel>
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
      <Box
        mx="10px"
        mt="12px"
        mb="8px"
        borderTop={`1px solid ${colors.grey200}`}
      />
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
