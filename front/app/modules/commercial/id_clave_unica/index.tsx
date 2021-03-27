import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import ClaveUnicaButton from './components/ClaveUnicaButton';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.button': (props) => {
      if (props.method.attributes.name !== 'clave_unica') return null;
      return <ClaveUnicaButton {...props} />;
    },
  },
};

export default configuration;
