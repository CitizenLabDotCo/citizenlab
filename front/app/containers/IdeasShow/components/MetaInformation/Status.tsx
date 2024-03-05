import React from 'react';

import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';

import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';

import StatusBadge from 'components/StatusBadge';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

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
