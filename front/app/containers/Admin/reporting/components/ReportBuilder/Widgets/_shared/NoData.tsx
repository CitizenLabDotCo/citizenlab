import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl, MessageDescriptor } from 'utils/cl-intl';

interface Props {
  message: MessageDescriptor;
}

const NoData = ({ message }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Text
      ml="16px"
      variant="bodyM"
      color="textSecondary"
      className="no-chart-data"
    >
      {formatMessage(message)}
    </Text>
  );
};

export default NoData;
