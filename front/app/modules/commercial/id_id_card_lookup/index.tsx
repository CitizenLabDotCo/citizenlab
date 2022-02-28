import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import IdCardLookupButton from './components/IdCardLookupButton';
import IdCardLookupForm from './components/IdCardLookupForm';
import { IDLookupMethod } from 'services/verificationMethods';
import { isLastVerificationMethod } from 'modules/commercial/verification';

const verificationMethodName = 'id_card_lookup';
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
          <IdCardLookupButton
            last={last}
            onMethodSelected={onMethodSelected}
            method={method as IDLookupMethod}
          />
        );
      }

      return null;
    },
    'app.components.VerificationModal.methodStep': (props) => {
      if (props.method.attributes.name !== 'id_card_lookup') return null;
      return (
        <IdCardLookupForm {...props} method={props.method as IDLookupMethod} />
      );
    },
  },
};

export default configuration;
