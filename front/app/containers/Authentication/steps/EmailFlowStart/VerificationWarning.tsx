import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useIdMethods from 'api/id_methods/useIdMethods';

import useAuthMethodNames, { getMethodName } from 'hooks/useAuthMethodNames';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

// The Warning component has a teal (light blue) background; override the icon
// colour to a dark blue shield to signal that verification is required.
const BlueShieldWarning = styled(Warning)`
  svg {
    fill: ${colors.blue700};
  }
`;

const VerificationWarning = () => {
  const { formatMessage } = useIntl();
  const names = useAuthMethodNames();
  const { data: idMethods } = useIdMethods();

  const authenticationVerificationMethodNames = (idMethods?.data ?? [])
    .filter((method) => {
      const { authentication_method, verification_method } = method.attributes;
      return authentication_method && verification_method;
    })
    .map((method) => getMethodName(method, names))
    .filter((name) => name.trim().length > 0);

  if (authenticationVerificationMethodNames.length === 0) return null;

  const text =
    authenticationVerificationMethodNames.length === 1
      ? formatMessage(messages.actionRequiresVerificationUsingMethod, {
          method: authenticationVerificationMethodNames[0],
        })
      : formatMessage(messages.actionRequiresVerificationUsingOneOf, {
          methods: authenticationVerificationMethodNames.join(', '),
        });

  return (
    <BlueShieldWarning icon="shield-checkered" mb="12px">
      {text}
    </BlueShieldWarning>
  );
};

export default VerificationWarning;
