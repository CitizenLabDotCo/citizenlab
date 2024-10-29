import React from 'react';

import { TVerificationMethodName } from 'api/verification_methods/types';
import { isLastVerificationMethod } from 'api/verification_methods/util';

import { FormattedMessage } from 'utils/cl-intl';
import { ModuleConfiguration } from 'utils/moduleUtils';

import messages from '../../../components/UI/ClaveUnicaButton/messages';

const ClaveUnicaButton = React.lazy(
  () => import('../../../components/UI/ClaveUnicaButton')
);

const verificationMethodName: TVerificationMethodName = 'clave_unica';
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
        const last = isLastVerificationMethod(
          verificationMethodName,
          verificationMethods
        );
        return (
          <ClaveUnicaButton
            last={last}
            method={method}
            message={<FormattedMessage {...messages.verifyClaveUnica} />}
            {...otherProps}
          />
        );
      }

      return null;
    },
  },
};

export default configuration;
