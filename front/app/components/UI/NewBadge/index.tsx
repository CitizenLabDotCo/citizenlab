import React from 'react';

// components
import { Badge, colors } from '@citizenlab/cl2-component-library';

// i18n
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
