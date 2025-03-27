import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const Settings = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Text>{formatMessage(messages.communityMonitorCTADescription)}</Text>
    </>
  );
};

export default Settings;
