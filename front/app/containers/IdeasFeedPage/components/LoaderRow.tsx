import React from 'react';

import { Spinner, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  hasNextPage: boolean | undefined;
}

const LoaderRow = ({ hasNextPage }: Props) => {
  const { formatMessage } = useIntl();

  if (hasNextPage) {
    return <Spinner />;
  }

  return (
    <Text fontWeight="bold" mt="-200px">
      {formatMessage(messages.endOfFeed)}
    </Text>
  );
};

export default LoaderRow;
