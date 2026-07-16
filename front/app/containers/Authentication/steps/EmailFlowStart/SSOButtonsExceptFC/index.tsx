import React from 'react';

import useIdMethods from 'api/id_methods/useIdMethods';
import { getAzureConfig } from 'api/id_methods/utils';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import { useLocation } from 'utils/router';

import SSOButton from './SSOButton';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

// Renders all enabled SSO providers (except FranceConnect), in display order.
const SSOButtonsExceptFC = ({ onClickSSO }: Props) => {
  // A hidden path that will show all methods inc any that are admin only
  const { pathname } = useLocation();
  const showAdminOnlyMethods = pathname.endsWith('/sign-in/admin');
  const { data: idMethods } = useIdMethods();

  const azureConfig = getAzureConfig(idMethods);
  const azureAdVisibility = azureConfig?.attributes.visibility;
  const azureAdIsVisible = ['show', undefined].includes(azureAdVisibility);
  const azureAdEnabled =
    !!azureConfig && (azureAdIsVisible || showAdminOnlyMethods);

  const authenticationMethodsExceptFC = idMethods?.data.filter((method) => {
    if (method.attributes.name === 'franceconnect') {
      return false;
    }

    if (method.attributes.name === 'azureactivedirectory') {
      return azureAdEnabled;
    }

    return method.attributes.authentication_method;
  });

  return (
    <>
      {
        authenticationMethodsExceptFC?.map((method) => (
          <SSOButton
            key={method.id}
            provider={method.attributes.name}
            onClickSSO={onClickSSO}
          />
        ))
      }
    </>
  );
};

export default SSOButtonsExceptFC;
