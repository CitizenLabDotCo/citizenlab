import React from 'react';

import { Box, Text, Tooltip } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useUserById from 'api/users/useUserById';

import Avatar from 'components/Avatar';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  createdAt: string;
  updatedAt: string;
  userId: string | undefined;
}

const T = ({ children }) => (
  <Text fontSize="s" color="textSecondary" mb="0px" mt="0px">
    {children}
  </Text>
);

const UpdatedOnMessage = ({ updatedAt }) => {
  const { formatMessage } = useIntl();

  const updatedDatetime = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
  const lastUpdateDaysAgo = moment().diff(moment(updatedAt), 'days');
  const updatedOn = formatMessage(messages.lastUpdate, {
    days: lastUpdateDaysAgo,
  });

  return (
    <Tooltip
      content={updatedDatetime}
      delay={500}
      placement="right"
      arrow={false}
    >
      <Box>
        <T>{updatedOn}</T>
      </Box>
    </Tooltip>
  );
};

const UserAvatar = ({ userData }) => (
  <Tooltip
    content={`${userData.attributes.first_name} ${userData.attributes.last_name}`}
    placement="bottom"
    delay={500}
  >
    <Box>
      <Avatar userId={userData.id} size={20} isLinkToProfile />
    </Box>
  </Tooltip>
);

const EditedText = ({ createdAt, updatedAt, userId }: Props) => {
  const { data: user } = useUserById(userId);
  const createdOn = moment(createdAt).format('DD/MM/YYYY');

  return (
    <Box display="flex" alignItems="center">
      <T>{`${createdOn} • `}</T>
      {userId && user && <UserAvatar userData={user.data} />}
      <UpdatedOnMessage updatedAt={updatedAt} />
    </Box>
  );
};

export default EditedText;
