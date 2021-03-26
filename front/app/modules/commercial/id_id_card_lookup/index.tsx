import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import IdCardLookupButton from './components/IdCardLookupButton';
import IdCardLookupForm from './components/IdCardLookupForm';
import { IDLookupMethod } from 'services/verificationMethods';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.button': (props) => {
      if (props.method.attributes.name !== 'id_card_lookup') return null;
      return (
        <IdCardLookupButton
          {...props}
          method={props.method as IDLookupMethod}
        />
      );
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
