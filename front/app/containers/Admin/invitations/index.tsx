import React from 'react';
import { useLocation } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import { Outlet as RouterOutlet } from 'react-router-dom';
import GoBackButton from 'components/UI/GoBackButton';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

import clHistory from 'utils/cl-router/history';

const InvitationsPage = (props: WrappedComponentProps) => {
  const location = useLocation();
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

  const goBack = () => {
    clHistory.goBack();
  };
  const hasGoBackLink = location.key !== 'default';

  return (
    <>
      {hasGoBackLink && (
        <Box w="100%">
          <GoBackButton onClick={goBack} />
        </Box>
      )}
      <TabbedResource resource={resource} tabs={tabs}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <div id="e2e-invitations-container">
          <RouterOutlet />
        </div>
      </TabbedResource>
    </>
  );
};

export default injectIntl(InvitationsPage);
