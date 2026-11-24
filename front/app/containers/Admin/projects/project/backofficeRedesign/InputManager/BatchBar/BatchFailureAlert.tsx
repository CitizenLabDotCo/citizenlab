import React from 'react';

import Text from 'design-system/Text';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { BatchFailure } from './useBatchActions';

interface Props {
  failure: BatchFailure | undefined;
}

const BatchFailureAlert = ({ failure }: Props) => {
  const { formatMessage } = useIntl();

  if (!failure) return null;

  const { action, failed, total } = failure;

  return (
    <Text as="span" variant="small" tone="danger" role="alert">
      {formatMessage(
        action === 'delete'
          ? messages.batchDeleteFailed
          : messages.batchUpdateFailed,
        { failed, total }
      )}
    </Text>
  );
};

export default BatchFailureAlert;
