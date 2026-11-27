import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

// The library's empty Manage view: the notebook and one sentence.
const EmptyList = () => {
  const { formatMessage } = useIntl();

  return (
    <DesignSystemEmptyState context="panel" illustration="large">
      {formatMessage(messages.manageEmpty)}
    </DesignSystemEmptyState>
  );
};

export default EmptyList;
