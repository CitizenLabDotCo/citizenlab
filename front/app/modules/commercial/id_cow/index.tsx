import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import CowButton from './components/CowButton';
import VerificationFormCOW from './components/VerificationFormCOW';
import { isLastVerificationMethod } from 'modules/commercial/verification';

const verificationMethodName = 'id_cow';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      onClick,
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
          <CowButton
            last={last}
            onMethodSelected={onMethodSelected}
            method={method}
          />
        );
      }

      return null;
    },
    'app.components.VerificationModal.methodStep': (props) => {
      if (props.method.attributes.name !== 'cow') return null;

      return <VerificationFormCOW {...props} />;
    },
  },
};

export default configuration;
