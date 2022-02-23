import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import BogusButton from './components/BogusButton';
import VerificationFormBogus from './components/VerificationFormBogus';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      onClick,
    }) => {
      const method = verificationMethods.find(
        (vm) => vm.attributes.name === 'bogus'
      );

      if (method) {
        const last =
          verificationMethods
            .map((vm) => vm.attributes.name)
            .indexOf('bogus') ===
          verificationMethods.length - 1;
        const onMethodSelected = () => onClick('bogus');

        return (
          <BogusButton
            method={method}
            last={last}
            onMethodSelected={onMethodSelected}
          />
        );
      }

      return null;
    },
    'app.components.VerificationModal.methodStep': (props) => {
      if (props.method.attributes.name !== 'bogus') return null;
      return <VerificationFormBogus {...props} />;
    },
  },
};

export default configuration;
