import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import GentRrnButton from './components/GentRrnButton';
import VerificationFormGentRrn from './components/VerificationFormGentRrn';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': (props) => {
      if (props.method.attributes.name !== 'gent_rrn') return null;
      return <GentRrnButton {...props} />;
    },
    'app.components.VerificationModal.methodStep': (props) => {
      if (props.method.attributes.name !== 'gent_rrn') return null;

      return <VerificationFormGentRrn {...props} />;
    },
  },
};

export default configuration;
