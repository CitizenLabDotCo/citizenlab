import React from 'react';

import { IdMethodName } from 'api/id_methods/types';
import { isLastIdMethod } from 'api/id_methods/utils';

import { ModuleConfiguration } from 'utils/moduleUtils';

const OostendeRrnButton = React.lazy(
  () => import('./components/OostendeRrnButton')
);
const VerificationFormOostendeRrn = React.lazy(
  () => import('./components/VerificationFormOostendeRrn')
);

const verificationMethodName: IdMethodName = 'oostende_rrn';
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
        return (
          <OostendeRrnButton method={method} last={last} {...otherProps} />
        );
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
        return <VerificationFormOostendeRrn method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
