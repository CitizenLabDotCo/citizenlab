import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { ImageSizes } from 'typings';

import { AvatarImageBubble } from 'components/AvatarBubbles';
import { BubbleContainer } from 'components/AvatarBubbles/Containers';
import placeholderImage from 'components/AvatarBubbles/user.png';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Manager = {
  first_name?: string;
  last_name?: string;
  avatar?: ImageSizes;
};

interface Props {
  managers: Manager[];
}

const SIZE = 24;
const OVERLAP = 12;

const ManagerBubbles = ({ managers }: Props) => {
  const { formatMessage } = useIntl();

  const getFullName = (firstName?: string, lastName?: string): string => {
    return [firstName, lastName].filter(Boolean).join(' ');
  };

  if (managers.length === 0) {
    return (
      <Box display="flex" alignItems="center">
        <Box
          w="20px"
          h="20px"
          borderRadius="20px"
          bgColor={colors.grey300}
          mr="6px"
        />
        <Text m="0" fontSize="s" color="textPrimary">
          {formatMessage(messages.notAssigned)}
        </Text>
      </Box>
    );
  }

  if (managers.length === 1) {
    return (
      <Box display="flex" alignItems="center">
        <Box ml="-2px" mr="4px">
          <BubbleContainer
            bubbleSize={SIZE}
            overlap={OVERLAP}
            avatarImagesCount={1}
          >
            <AvatarImageBubble
              src={managers[0].avatar?.medium ?? placeholderImage}
              alt={getFullName(managers[0].first_name, managers[0].last_name)}
              overlap={OVERLAP}
              index={0}
              size={SIZE}
            />
          </BubbleContainer>
        </Box>
        <Text 
          m="0" 
          fontSize="s" 
          color="textPrimary"
          wordBreak="break-word"
        >
          {getFullName(managers[0].first_name, managers[0].last_name)}
        </Text>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center">
      <Box ml="-2px" mr="4px">
        <BubbleContainer
          bubbleSize={SIZE}
          overlap={OVERLAP}
          avatarImagesCount={1}
        >
          <AvatarImageBubble
            src={managers[0].avatar?.medium ?? placeholderImage}
            alt={getFullName(managers[0].first_name, managers[0].last_name)}
            overlap={OVERLAP}
            index={0}
            size={SIZE}
          />
          <AvatarImageBubble
            src={managers[1].avatar?.medium ?? placeholderImage}
            alt={getFullName(managers[1].first_name, managers[1].last_name)}
            overlap={OVERLAP}
            index={1}
            size={SIZE}
          />
        </BubbleContainer>
      </Box>
      <Text m="0" ml="10px" fontSize="s" color="textPrimary">
        {formatMessage(messages.xManagers, {
          numberOfManagers: managers.length,
        })}
      </Text>
    </Box>
  );
};

export default ManagerBubbles;
