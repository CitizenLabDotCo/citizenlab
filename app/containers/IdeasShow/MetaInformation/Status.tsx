import React from 'react';
import { Header, Item } from './';

// hooks
import useIdeaStatus from 'hooks/useIdeaStatus';

// components
import StatusBadge from 'components/StatusBadge';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  statusId: string;
}

const Status = ({ statusId }: Props) => {
  const ideaStatus = useIdeaStatus({ statusId });

  if (!isNilOrError(ideaStatus)) {
    return (
      <Item>
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
