import React from 'react';
import moment from 'moment';

// hooks
import useUser from 'hooks/useUser';

// components
import { Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  updatedAt: string;
  userId: string;
}

const EditedText = ({ updatedAt, userId }: Props) => {
  const user = useUser({ userId });
  const { formatMessage } = useIntl();

  if (isNilOrError(user)) return null;

  const createdOn = moment().format('DD/MM/YYYY'); // TODO
  const lastUpdateDaysAgo = moment().diff(moment(updatedAt), 'days');

  return (
    <Text fontSize="s" color="textSecondary" mb="0px" mt="0px">
      {formatMessage(messages.createdOn, { date: createdOn })}
      {' • '}
      {formatMessage(messages.lastUpdate, {
        days: lastUpdateDaysAgo,
        author: user.attributes.first_name,
      })}
    </Text>
  );
};

export default EditedText;
