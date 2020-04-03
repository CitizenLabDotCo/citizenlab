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
    { label: this.props.intl.formatMessage(messages.tabInviteUsers), url: '/admin/invitations' },
    { label: this.props.intl.formatMessage(messages.tabAllInvitations), url: '/admin/invitations/all' },
  ];
  const resource = {
    title: this.props.intl.formatMessage(messages.invitePeople),
    subtitle: this.props.intl.formatMessage(messages.invitationSubtitle)
  };

  const { children } = props;
  return (
    <TabbedResource
      resource={resource}
      tabs={tabs}
    >
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      {children}
    </TabbedResource>
  );
});

export default injectIntl(InvitationsPage);
