import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLError } from 'typings';

import useIdMethods from 'api/id_methods/useIdMethods';
import { getSsoEnforcedMethod } from 'api/id_methods/utils';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import useVisibleIdMethodsExceptFC from '../useVisibleIdMethodsExceptFC';

import SSOButton from './SSOButtonsExceptFC/SSOButton';

interface Props {
  error: CLError;
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

// Shown when the email's domain must sign in with a staff SSO method. If that
// method's button is kept out of the login modal ("link" or "hide"
// visibility), we show it here, so the user can sign in without leaving the
// page they were on.
const SSOEnforcedButton = ({ error, onClickSSO }: Props) => {
  const { data: idMethods } = useIdMethods();
  const visibleIdMethods = useVisibleIdMethodsExceptFC();

  const method = getSsoEnforcedMethod(idMethods, error);
  if (!method) return null;

  const alreadyShown = visibleIdMethods.some(
    (visibleMethod) => visibleMethod.attributes.name === method.attributes.name
  );
  if (alreadyShown) return null;

  return (
    <Box mt="16px">
      <SSOButton provider={method.attributes.name} onClickSSO={onClickSSO} />
    </Box>
  );
};

export default SSOEnforcedButton;
