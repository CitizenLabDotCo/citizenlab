import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import BosaFasButton from './components/BosaFasButton';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.button': (props) => {
      if (props.method.attributes.name !== 'bosa_fas') return null;
      return <BosaFasButton {...props} />;
    },
  },
};

export default configuration;
