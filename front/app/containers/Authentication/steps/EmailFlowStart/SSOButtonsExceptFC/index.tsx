import React from 'react';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import useSSOProviders from './providers';
import SSOButton from './SSOButton';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

// Renders all enabled SSO providers (except FranceConnect), in display order.
const SSOButtonsExceptFC = ({ onClickSSO }: Props) => {
  const { allProviders } = useSSOProviders();

  return (
    <>
      {allProviders.map((provider) => (
        <SSOButton key={provider} provider={provider} onClickSSO={onClickSSO} />
      ))}
    </>
  );
};

export default SSOButtonsExceptFC;
