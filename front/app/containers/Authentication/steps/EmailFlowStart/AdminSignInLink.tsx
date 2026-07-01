import React from 'react';

import { Box, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthConfig from 'containers/Authentication/useAuthConfig';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const StyledA = styled.a`
  font-size: ${fontSizes.base}px;
`;

// Link shown when Azure AD is configured with "link" visibility, letting
// admins / project managers sign in through the dedicated admin route.
const AdminSignInLink = () => {
  const { azureAdSettings } = useAuthConfig();
  const { formatMessage } = useIntl();

  if (azureAdSettings?.visibility !== 'link') return null;

  return (
    <Box mt="24px">
      <StyledA href="/sign-in/admin">
        {formatMessage(messages.clickHereToLoginAsAdminOrPM)}
      </StyledA>
    </Box>
  );
};

export default AdminSignInLink;
