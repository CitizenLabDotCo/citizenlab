import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import BosaFasButton from './components/BosaFasButton';
import { isLastVerificationMethod } from 'modules/commercial/verification';

const verificationMethodName = 'clave_unica';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({ verificationMethods }) => {
      const method = verificationMethods.find(
        (vm) => vm.attributes.name === verificationMethodName
      );

      if (method) {
        const last = isLastVerificationMethod(
          verificationMethodName,
          verificationMethods
        );
        return <BosaFasButton last={last} method={method} />;
      }

      return null;
    },
  },
};

export default configuration;
