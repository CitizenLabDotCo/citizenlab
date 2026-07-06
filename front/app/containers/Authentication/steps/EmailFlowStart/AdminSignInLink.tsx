import React from 'react';

import { Box, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useIdMethods from 'api/id_methods/useIdMethods';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { getAzureConfig } from './utils';

const StyledA = styled.a`
  font-size: ${fontSizes.base}px;
`;

// Link shown when Azure AD is configured with "link" visibility, letting
// admins / project managers sign in through the dedicated admin route.
const AdminSignInLink = () => {
  const { data: idMethods } = useIdMethods();
  const azureConfig = getAzureConfig(idMethods);
  const { formatMessage } = useIntl();

  if (azureConfig?.attributes.visibility !== 'link') return null;

  return (
    <Box mt="24px">
      <StyledA href="/sign-in/admin">
        {formatMessage(messages.clickHereToLoginAsAdminOrPM)}
      </StyledA>
    </Box>
  );
};

export default AdminSignInLink;
