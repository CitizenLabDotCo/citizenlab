import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import BogusButton from './components/BogusButton';
import VerificationFormBogus from './components/VerificationFormBogus';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttonss': (props) => {
      if (props.method.attributes.name !== 'bogus') return null;
      return <BogusButton {...props} />;
    },
    'app.components.VerificationModal.methodStep': (props) => {
      if (props.method.attributes.name !== 'bogus') return null;
      return <VerificationFormBogus {...props} />;
    },
  },
};

export default configuration;
