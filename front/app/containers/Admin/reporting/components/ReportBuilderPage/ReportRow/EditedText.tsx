import React from 'react';
import moment from 'moment';

// hooks
import useUserById from 'api/users/useUserById';

// components
import { Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils

interface Props {
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const EditedText = ({ createdAt, updatedAt, userId }: Props) => {
  const { data: user } = useUserById(userId);
  const { formatMessage } = useIntl();

  if (!user) return null;

  const createdOn = moment(createdAt).format('DD/MM/YYYY');
  const lastUpdateDaysAgo = moment().diff(moment(updatedAt), 'days');

  return (
    <Text fontSize="s" color="textSecondary" mb="0px" mt="0px">
      {formatMessage(messages.createdOn, { date: createdOn })}
      {' • '}
      {formatMessage(messages.lastUpdate, {
        days: lastUpdateDaysAgo,
        author: user.data.attributes.first_name ?? '',
      })}
    </Text>
  );
};

export default EditedText;
