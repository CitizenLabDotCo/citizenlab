import React from 'react';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import useVisibleIdMethodsExceptFC from '../../useVisibleIdMethodsExceptFC';

import SSOButton from './SSOButton';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

// Renders all enabled SSO providers (except FranceConnect), in display order.
const SSOButtonsExceptFC = ({ onClickSSO }: Props) => {
  const visibleIdMethodsExceptFC = useVisibleIdMethodsExceptFC();

  const authenticationMethodsExceptFC = visibleIdMethodsExceptFC.filter(
    (method) => method.attributes.authentication_method
  );

  return (
    <>
      {authenticationMethodsExceptFC.map((method) => (
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
