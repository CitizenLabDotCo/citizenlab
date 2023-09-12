import React from 'react';
import { useLocation, Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import GoBackButton from 'components/UI/GoBackButton';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

import clHistory from 'utils/cl-router/history';

const InvitationsPage = () => {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const tabs = [
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
        <Box mb="16px">
          <Warning
            text={
              <Text color="primary" m="0px" fontSize="s">
                {formatMessage(messages.invitationExpirationWarning)}
              </Text>
            }
          />
        </Box>
        <RouterOutlet />
      </TabbedResource>
    </>
  );
};

export default InvitationsPage;
