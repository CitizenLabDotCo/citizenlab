import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';

import { useIntl } from 'utils/cl-intl';

import phaseMessages from '../Phase/messages';

import useInputTermLabels from './useInputTermLabels';

// The library's empty Manage view: the notebook and one sentence.
const EmptyState = () => {
  const { formatMessage } = useIntl();
  const { terms } = useInputTermLabels();

  return (
    <DesignSystemEmptyState context="panel" illustration="large">
      {formatMessage(phaseMessages.manageEmpty, { terms })}
    </DesignSystemEmptyState>
  );
};

export default EmptyState;
