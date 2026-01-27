import React from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import BulletPoint from './BulletPoint';
import messages from './messages';

interface Props {
  onCreateAccount: () => void;
}

const PostParticipationBox = ({ onCreateAccount }: Props) => {
  return (
    <Box
      border={stylingConsts.border}
      borderRadius={stylingConsts.borderRadius}
      px="12px"
      pb="12px"
      mb="16px"
    >
      <Title variant="h4" as="h2">
        <FormattedMessage {...messages.stayConnected} />
      </Title>
      <Text mb="12px">
        <FormattedMessage {...messages.createAnAccountToFollow} />
      </Text>
      <Box display="flex" flexDirection="column" gap="8px">
        <BulletPoint iconName="notification" message={messages.getUpdates} />
        <BulletPoint
          iconName="chat-bubble"
          message={messages.joinDiscussions}
        />
        <BulletPoint
          iconName="projects"
          message={messages.participateInOtherProjects}
        />
      </Box>
      <Button
        onClick={onCreateAccount}
        mt="16px"
        dataCy="post-participation-signup"
      >
        <FormattedMessage {...messages.createAnAccount} />
      </Button>
    </Box>
  );
};

export default PostParticipationBox;
