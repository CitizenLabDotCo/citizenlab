import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import './services/verificationMethods';
import CowButton from './components/CowButton';
import VerificationFormCOW from './components/VerificationFormCOW';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.button': (props) => {
      if (props.method.attributes.name !== 'cow') return null;
      return <CowButton {...props} />;
    },
    'app.components.VerificationModal.methodStep': (props) => {
      if (props.method.attributes.name !== 'cow') return null;

      return <VerificationFormCOW {...props} />;
    },
  },
};

export default configuration;
