import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useUserById from 'api/users/useUserById';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  createdAt: string;
  updatedAt: string;
  userId: string | undefined;
}

const EditedText = ({ createdAt, updatedAt, userId }: Props) => {
  const { data: user } = useUserById(userId);
  const { formatMessage } = useIntl();

  const createdOn = moment(createdAt).format('DD/MM/YYYY');
  const lastUpdateDaysAgo = moment().diff(moment(updatedAt), 'days');

  return (
    <Text fontSize="s" color="textSecondary" mb="0px" mt="0px">
      {formatMessage(messages.createdOn, { date: createdOn })}
      {user && ' • '}
      {user &&
        formatMessage(messages.lastUpdate, {
          days: lastUpdateDaysAgo,
          author: user.data.attributes.first_name ?? '',
        })}
    </Text>
  );
};

export default EditedText;
