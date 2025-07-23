import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import { AvatarImageBubble } from 'components/AvatarBubbles';
import { BubbleContainer } from 'components/AvatarBubbles/Containers';

import { useIntl } from 'utils/cl-intl';
import { truncate } from 'utils/textUtils';

import messages from './messages';

interface Props {
  project: ProjectMiniAdminData;
}

const SIZE = 20;
const OVERLAP = 12;

const Managers = ({ project }: Props) => {
  const { formatMessage } = useIntl();

  const managers = project.attributes.project_managers;

  const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'No name';
    return truncate(`${firstName} ${lastName}`, 12);
  };

  if (managers.length === 0) {
    return (
      <Box display="flex" alignItems="center">
        <Box
          w="20px"
          h="20px"
          borderRadius="20px"
          bgColor={colors.grey300}
          mr="4px"
        />
        <Text m="0" fontSize="s" color="textPrimary">
          Not assigned
        </Text>
      </Box>
    );
  }

  if (managers.length === 1) {
    return (
      <Box display="flex" alignItems="center">
        <BubbleContainer
          bubbleSize={SIZE}
          overlap={OVERLAP}
          avatarImagesCount={1}
        >
          <AvatarImageBubble
            src={managers[0].avatar.medium ?? undefined}
            alt={getFullName(managers[0].first_name, managers[0].last_name)}
            overlap={12}
            index={0}
            size={SIZE}
          />
        </BubbleContainer>
        <Text m="0" fontSize="s" color="textPrimary">
          {getFullName(managers[0].first_name, managers[0].last_name)}
        </Text>
      </Box>
    );
  }

  return (
    <Text m="0" fontSize="s" color="textPrimary">
      {formatMessage(messages.xManagers, { numberOfManagers: managers.length })}
    </Text>
  );
};

export default Managers;
