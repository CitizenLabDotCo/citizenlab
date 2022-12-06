import React from 'react';
// hooks
import useIdeaStatus from 'hooks/useIdeaStatus';
import { FormattedMessage } from 'utils/cl-intl';
// utils
import { isNilOrError } from 'utils/helperUtils';
import { Header, Item } from 'components/IdeasShowComponents/MetaInfoStyles';
// components
import StatusBadge from 'components/StatusBadge';
// i18n
import messages from './messages';

interface Props {
  statusId: string;
  compact?: boolean;
  className?: string;
}

const Status = ({ statusId, compact, className }: Props) => {
  const ideaStatus = useIdeaStatus({ statusId });

  if (!isNilOrError(ideaStatus)) {
    return (
      <Item className={className || ''} compact={compact}>
        <Header>
          <FormattedMessage {...messages.currentStatus} />
        </Header>
        <StatusBadge id="e2e-idea-status-badge" statusId={statusId} />
      </Item>
    );
  }

  return null;
};

export default Status;
