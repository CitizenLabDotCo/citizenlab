import React from 'react';

import { IdMethodName, IDLookupMethod } from 'api/id_methods/types';
import { isLastIdMethod } from 'api/id_methods/utils';

import { ModuleConfiguration } from 'utils/moduleUtils';

const IdCardLookupButton = React.lazy(
  () => import('./components/IdCardLookupButton')
);
const IdCardLookupForm = React.lazy(
  () => import('./components/IdCardLookupForm')
);

const verificationMethodName: IdMethodName = 'id_card_lookup';
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
          <IdCardLookupButton
            last={last}
            method={method as IDLookupMethod}
            {...otherProps}
          />
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
        activeStep === 'method-step' &&
        method?.attributes.name === verificationMethodName
      ) {
        return (
          <IdCardLookupForm method={method as IDLookupMethod} {...otherProps} />
        );
      }

      return null;
    },
  },
};

export default configuration;
