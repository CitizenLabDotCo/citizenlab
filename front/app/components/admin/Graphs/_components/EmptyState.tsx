import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
// components
import { NoDataContainer } from 'components/admin/GraphWrappers';
// i18n
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
