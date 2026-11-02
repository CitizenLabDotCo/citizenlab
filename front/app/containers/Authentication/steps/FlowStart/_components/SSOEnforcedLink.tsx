import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useIdMethods from 'api/id_methods/useIdMethods';
import { getEmployeeSsoConfigs } from 'api/id_methods/utils';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useLocation } from 'utils/router';

import messages from '../messages';

// Shown when the email's domain must sign in with a staff SSO method. If that
// method is kept out of the login modal ("link" or "hide" visibility), the
// user has no button to click, so we point them to the admin sign-in page.
const SSOEnforcedLink = () => {
  const { data: idMethods } = useIdMethods();
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();

  const onAdminSignInPage = pathname.endsWith('/sign-in/admin');
  const hasHiddenMethod = getEmployeeSsoConfigs(idMethods).some(
    (method) =>
      method.attributes.visibility === 'link' ||
      method.attributes.visibility === 'hide'
  );

  if (onAdminSignInPage || !hasHiddenMethod) return null;

  return (
    <Box mt="16px">
      <Link to="/sign-in/admin">
        {formatMessage(messages.signInWithEmployeeAccount)}
      </Link>
    </Box>
  );
};

export default SSOEnforcedLink;
