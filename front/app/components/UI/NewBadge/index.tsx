import React from 'react';

import { Badge, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const NewBadge = () => {
  const { formatMessage } = useIntl();

  return (
    <Badge color={colors.teal400} className="inverse">
      {formatMessage(messages.newBadge)}
    </Badge>
  );
};

export default NewBadge;
