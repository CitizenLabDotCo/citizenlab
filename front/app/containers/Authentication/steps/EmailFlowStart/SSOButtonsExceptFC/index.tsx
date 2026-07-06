import React from 'react';

import useIdMethods from 'api/id_methods/useIdMethods';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import SSOButton from './SSOButton';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

// Renders all enabled SSO providers (except FranceConnect), in display order.
const SSOButtonsExceptFC = ({ onClickSSO }: Props) => {
  const { data: idMethods } = useIdMethods();

  const authenticationMethodsExceptFC = idMethods?.data.filter((method) => {
    const isAuthMethod = method.attributes.authentication_method;
    const isFC = method.attributes.name === 'franceconnect';
    return !isFC && isAuthMethod;
  });

  return (
    <>
      {authenticationMethodsExceptFC?.map((method) => (
        <SSOButton
          key={method.id}
          provider={method.attributes.name}
          onClickSSO={onClickSSO}
        />
      ))}
    </>
  );
};

export default SSOButtonsExceptFC;
