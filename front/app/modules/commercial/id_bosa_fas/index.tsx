import React from 'react';

import { IdMethodName } from 'api/id_methods/types';
import { isLastIdMethod } from 'api/id_methods/util';

import { ModuleConfiguration } from 'utils/moduleUtils';

const BosaFasButton = React.lazy(() => import('./components/BosaFasButton'));

const verificationMethodName: IdMethodName = 'bosa_fas';
const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.VerificationModal.buttons': ({
      verificationMethods,
      ...otherProps
    }) => {
      const method = verificationMethods.find(
        (vm) => vm.attributes.name === verificationMethodName
      );

      if (method) {
        const last = isLastIdMethod(
          verificationMethodName,
          verificationMethods
        );
        return <BosaFasButton last={last} method={method} {...otherProps} />;
      }

      return null;
    },
  },
};

export default configuration;
