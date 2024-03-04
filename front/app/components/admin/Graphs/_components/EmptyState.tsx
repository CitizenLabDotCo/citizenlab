import React from 'react';

import { NoDataContainer } from 'components/admin/GraphWrappers';

import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

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
