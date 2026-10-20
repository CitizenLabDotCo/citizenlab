import React from 'react';

import { Box, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useIdMethods from 'api/id_methods/useIdMethods';
import { getEmployeeSsoConfigs } from 'api/id_methods/utils';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const StyledA = styled.a`
  font-size: ${fontSizes.base}px;
`;

// Link shown when a staff method (Azure AD, Okta) is configured with "link"
// visibility, letting admins / project managers sign in through the dedicated
// admin route.
const AdminSignInLink = () => {
  const { data: idMethods } = useIdMethods();
  const { formatMessage } = useIntl();

  const hasLinkedMethod = getEmployeeSsoConfigs(idMethods).some(
    (method) => method.attributes.visibility === 'link'
  );

  if (!hasLinkedMethod) return null;

  return (
    <Box mt="24px">
      <StyledA href="/sign-in/admin">
        {formatMessage(messages.clickHereToLoginAsAdminOrPM)}
      </StyledA>
    </Box>
  );
};

export default AdminSignInLink;
