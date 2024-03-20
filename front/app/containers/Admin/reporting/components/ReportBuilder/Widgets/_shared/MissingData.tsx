import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const MissingData = () => {
  const { formatMessage } = useIntl();

  return (
    <Text variant="bodyM" color="red600" className="e2e-widget-missing-data">
      {formatMessage(messages.missingData)}
    </Text>
  );
};

export default MissingData;
