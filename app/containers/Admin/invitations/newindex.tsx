import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

export class InvitationsPage extends React.PureComponent<InjectedIntlProps> {
  private tabs = [
    { label: this.props.intl.formatMessage(messages.tabInviteUsers), url: '/admin/invitations' },
    { label: this.props.intl.formatMessage(messages.tabAllInvitations), url: '/admin/invitations/all' },
  ];
  private resource = {
    title: this.props.intl.formatMessage(messages.invitePeople),
    subtitle: this.props.intl.formatMessage(messages.invitationSubtitle)
  };

  render() {
    const { children } = this.props;
    return (
      <TabbedResource
        resource={this.resource}
        tabs={this.tabs}
      >
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {children}
      </TabbedResource>
    );
  }
}

export default injectIntl(InvitationsPage);
