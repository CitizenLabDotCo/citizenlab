import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ManagementFeed = () => {
  const { formatMessage } = useIntl();
  return (
    <Title color="primary" m="0px">
      {formatMessage(messages.title)}
    </Title>
  );
};

export default ManagementFeed;
