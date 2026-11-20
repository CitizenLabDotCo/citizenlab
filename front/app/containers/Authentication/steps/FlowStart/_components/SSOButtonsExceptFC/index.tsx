import React from 'react';

import { IdMethodData } from 'api/id_methods/types';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import SSOButton from './SSOButton';

interface Props {
  methods: IdMethodData[];
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

// Renders a button for each given SSO method, in the order given.
const SSOButtonsExceptFC = ({ methods, onClickSSO }: Props) => (
  <>
    {methods.map((method) => (
      <SSOButton
        key={method.id}
        provider={method.attributes.name}
        onClickSSO={onClickSSO}
      />
    ))}
  </>
);

export default SSOButtonsExceptFC;
