import React, { SFC } from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

interface Props {}

const UsersPage: SFC<Props & InjectedIntlProps> = ({ children, intl }) => {
  const { formatMessage } = intl;

  const tabs = [
    { label: formatMessage(messages.tabRegisteredUsers), url: '/admin/users/registered' },
    { label: formatMessage(messages.tabInviteByEmail), url: '/admin/users/invitations' },
  ];

  const resource = {
    title: formatMessage(messages.viewPublicResource)
  };

  return (
    <>
      <TabbedResource
        resource={resource}
        messages={messages}
        tabs={tabs}
      >
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {children}
      </TabbedResource>
    </>
  );
};

export default injectIntl(UsersPage);
