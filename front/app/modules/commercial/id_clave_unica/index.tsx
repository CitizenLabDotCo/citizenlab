import React from 'react';

import { TVerificationMethodName } from 'api/verification_methods/types';

import { FormattedMessage } from 'utils/cl-intl';
import { ModuleConfiguration } from 'utils/moduleUtils';

import messages from '../../../components/UI/ClaveUnicaButton/messages';

import ClaveUnicaButtonWrapper from './components/ClaveUnicaButtonWrapper';

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
        return (
          <ClaveUnicaButtonWrapper
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
