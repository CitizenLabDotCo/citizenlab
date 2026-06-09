import React from 'react';

import { IdMethodName } from 'api/id_methods/types';
import { isLastIdMethod } from 'api/id_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

const CowButton = React.lazy(() => import('./components/CowButton'));
const VerificationFormCOW = React.lazy(
  () => import('./components/VerificationFormCOW')
);

const verificationMethodName: IdMethodName = 'cow';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      idMethods,
      ...otherProps
    }) => {
      const method = idMethods.find(
        (vm) => vm.attributes.name === verificationMethodName
      );

      if (method) {
        const last = isLastIdMethod(
          verificationMethodName,
          idMethods
        );
        return <CowButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
    'app.components.VerificationModal.methodSteps': ({
      method,
      activeStep,
      ...otherProps
    }) => {
      if (
        method?.attributes.name === verificationMethodName &&
        activeStep === 'method-step'
      ) {
        return <VerificationFormCOW {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
