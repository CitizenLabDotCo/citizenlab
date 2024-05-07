import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Avatar from 'components/Avatar';

import useUserById from 'api/users/useUserById';

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

const EditedText = ({ createdAt, updatedAt, userId }: Props) => {
  const { data: user } = useUserById(userId);
  const { formatMessage } = useIntl();

  const createdOn = moment(createdAt).format('DD/MM/YYYY');
  const lastUpdateDaysAgo = moment().diff(moment(updatedAt), 'days');
  const updatedOn = formatMessage(messages.lastUpdate, {
    days: lastUpdateDaysAgo,
  });

  return (
    <Box display="flex" alignItems="center">
      <T>{`${createdOn} • `}</T>
      {userId && user && <Avatar userId={userId} size={20} isLinkToProfile />}
      <T>{updatedOn}</T>
    </Box>
  );
};

export default EditedText;
