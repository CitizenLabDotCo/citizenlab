import { Header, Item } from 'components/IdeasShowComponents/MetaInfoStyles';
import React from 'react';

// hooks
import useIdeaStatus from 'hooks/useIdeaStatus';

// components
import StatusBadge from 'components/StatusBadge';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
