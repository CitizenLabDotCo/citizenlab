import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import { IDAuth0Method } from 'services/verificationMethods';
import Auth0Button from './components/Auth0Button';
import { isLastVerificationMethod } from 'modules/commercial/verification';

const verificationMethodName = 'auth0';
// note dependency on
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      onClick,
      ...props
    }) => {
      const method = verificationMethods.find(
        (vm) => vm.attributes.name === verificationMethodName
      );

      if (method) {
        const last = isLastVerificationMethod(
          verificationMethodName,
          verificationMethods
        );
        const onMethodSelected = () => onClick(verificationMethodName);
        return (
          <Auth0Button
            verificationMethod={method as IDAuth0Method}
            onClick={onMethodSelected}
            last={last}
            {...props}
          />
        );
      }

      return null;
    },
  },
};

export default configuration;
