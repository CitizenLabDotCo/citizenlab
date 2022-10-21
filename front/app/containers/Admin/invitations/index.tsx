import React from 'react';

// components
import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import { Outlet as RouterOutlet } from 'react-router-dom';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const InvitationsPage = (props: WrappedComponentProps) => {
  const tabs = [
    {
      label: props.intl.formatMessage(messages.tabInviteUsers),
      url: '/admin/invitations',
      name: 'index',
    },
    {
      label: props.intl.formatMessage(messages.tabAllInvitations),
      url: '/admin/invitations/all',
      name: 'all',
    },
  ];
  const resource = {
    title: props.intl.formatMessage(messages.invitePeople),
    subtitle: props.intl.formatMessage(messages.invitationSubtitle),
  };

  return (
    <TabbedResource resource={resource} tabs={tabs}>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      <div id="e2e-invitations-container">
        <RouterOutlet />
      </div>
    </TabbedResource>
  );
};

export default injectIntl(InvitationsPage);
