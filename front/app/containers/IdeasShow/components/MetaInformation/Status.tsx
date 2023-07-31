import React from 'react';
import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';

// hooks
import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';

// components
import StatusBadge from 'components/StatusBadge';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils

interface Props {
  statusId: string;
  compact?: boolean;
  className?: string;
}

const Status = ({ statusId, compact, className }: Props) => {
  const { data: ideaStatus } = useIdeaStatus(statusId);

  if (ideaStatus) {
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
