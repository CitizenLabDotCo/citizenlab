import React from 'react';

import { NoDataContainer } from 'components/admin/GraphWrappers';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  emptyContainerContent?: React.ReactNode;
}

const EmptyState = ({ emptyContainerContent }: Props) => (
  <NoDataContainer>
    {emptyContainerContent ? (
      <>{emptyContainerContent}</>
    ) : (
      <FormattedMessage {...messages.noData} />
    )}
  </NoDataContainer>
);

export default EmptyState;
