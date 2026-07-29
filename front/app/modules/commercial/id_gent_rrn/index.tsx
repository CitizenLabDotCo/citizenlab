import React from 'react';

import { IdMethodName } from 'api/id_methods/types';
import { isLastIdMethod } from 'api/id_methods/utils';

import { ModuleConfiguration } from 'utils/moduleUtils';

const GentRrnButton = React.lazy(() => import('./components/GentRrnButton'));
const VerificationFormGentRrn = React.lazy(
  () => import('./components/VerificationFormGentRrn')
);

const verificationMethodName: IdMethodName = 'gent_rrn';
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
        const last = isLastIdMethod(verificationMethodName, idMethods);
        return <GentRrnButton method={method} last={last} {...otherProps} />;
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
        return <VerificationFormGentRrn method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
