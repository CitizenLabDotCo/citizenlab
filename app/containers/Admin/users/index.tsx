import React, { SFC } from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// resources
import GetLocation, { GetLocationChildProps } from 'resources/GetLocation';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

interface InputProps {}

interface DataProps {
  location: GetLocationChildProps;
}

interface Props extends InputProps, DataProps {}

const UsersPage: SFC<Props & InjectedIntlProps> = ({ location, children, intl }) => {
  const { formatMessage } = intl;

  const tabs = [
    { label: formatMessage(messages.tabRegisteredUsers), url: '/admin/users/registered' },
    { label: formatMessage(messages.tabInviteByEmail), url: '/admin/users/invitations' },
  ];

  const resource = {
    title: formatMessage(messages.viewPublicResource)
  };

  if (!location) return null;

  return (
    <>
      <TabbedResource
        resource={resource}
        messages={messages}
        tabs={tabs}
        location={location}
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

const UsersPageWithIntl = injectIntl(UsersPage);

export default (inputProps: InputProps) => (
  <GetLocation>
    {location => <UsersPageWithIntl {...inputProps} location={location} />}
  </GetLocation>
);
