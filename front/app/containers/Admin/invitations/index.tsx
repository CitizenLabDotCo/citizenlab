import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'utils/router';
import { ITab } from 'typings';

import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const InvitationsPage = () => {
  const { formatMessage } = useIntl();
  // const location = useLocation();
  const tabs: ITab[] = [
    {
      label: formatMessage(messages.tabInviteUsers),
      url: '/admin/users/invitations',
      name: 'index',
    },
    {
      label: formatMessage(messages.tabAllInvitations),
      url: '/admin/users/invitations/all',
      name: 'all',
    },
  ];
  const resource = {
    title: formatMessage(messages.invitePeople),
    subtitle: formatMessage(messages.invitationSubtitle),
  };

  const goBack = () => {
    clHistory.goBack();
  };

  // TODO
  const hasGoBackLink = Math.random() > 0;
  // const hasGoBackLink = location.key !== 'default';

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
        <RouterOutlet />
      </TabbedResource>
    </>
  );
};

export default InvitationsPage;
