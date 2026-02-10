import React from 'react';

import {
  Box,
  Toggle,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NewLabel from 'components/UI/NewLabel';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  projectId: string;
}

const LiveAutoInputTopicsControl = ({ projectId }: Props) => {
  const isFeatureActive = useFeatureFlag({
    name: 'live_auto_input_topics',
  });
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();

  if (!isFeatureActive || !project) {
    return null;
  }

  const { live_auto_input_topics_enabled } = project.data.attributes;

  return (
    <Box mb="24px">
      <Toggle
        checked={live_auto_input_topics_enabled}
        onChange={() => {
          updateProject({
            projectId,
            live_auto_input_topics_enabled: !live_auto_input_topics_enabled,
          });
        }}
        label={
          <Box ml="8px">
            <Text
              color="primary"
              mb="0px"
              fontSize="m"
              fontWeight="semi-bold"
              display="flex"
            >
              <FormattedMessage {...messages.perspectives} />
              <IconTooltip
                mx="4px"
                content={
                  <FormattedMessage {...messages.liveAutoInputTopicsLabel} />
                }
              />
              <NewLabel />
            </Text>
            <Text color="coolGrey600" mt="0px" fontSize="m">
              <FormattedMessage {...messages.liveAutoInputTopicsDescription} />
            </Text>
          </Box>
        }
      />
    </Box>
  );
};

export default LiveAutoInputTopicsControl;
