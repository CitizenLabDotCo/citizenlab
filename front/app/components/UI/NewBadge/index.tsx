import React from 'react';
import moment from 'moment';

// components
import { Badge } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  expiryDate: string;
}

const NewBadge = ({ expiryDate }: Props) => {
  const { formatMessage } = useIntl();

  if (expiryDate) {
    const now = moment();
    const expiry = moment(expiryDate);
    if (expiry.isAfter(now)) {
      return null;
    }
  }

  return <Badge>{formatMessage(messages.newBadge)}</Badge>;
};

export default NewBadge;
