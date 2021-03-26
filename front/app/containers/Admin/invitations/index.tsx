import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

export interface Props {
  children: JSX.Element;
}

const InvitationsPage = React.memo((props: Props & InjectedIntlProps) => {
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

  const { children } = props;
  return (
    <TabbedResource resource={resource} tabs={tabs}>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      {children}
    </TabbedResource>
  );
});

export default injectIntl(InvitationsPage);
