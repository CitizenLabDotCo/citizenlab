import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { useIntl, MessageDescriptor } from 'utils/cl-intl';

interface Props {
  message: MessageDescriptor;
}

const NoData = ({ message }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Text variant="bodyM" color="textSecondary" className="no-chart-data">
      {formatMessage(message)}
    </Text>
  );
};

export default NoData;
