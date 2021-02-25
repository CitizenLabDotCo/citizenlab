import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import VerificationFranceConnectButton from './components/VerificationFranceConnectButton';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.button': (props) => {
      if (props.method.attributes.name !== 'franceconnect') return null;
      return <VerificationFranceConnectButton {...props} />;
    },
  },
};

export default configuration;
