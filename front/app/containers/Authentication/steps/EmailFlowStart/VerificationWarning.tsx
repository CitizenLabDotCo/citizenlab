import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

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

interface Props {
  // Names of the enabled authentication + verification methods.
  methodNames: string[];
}

const VerificationWarning = ({ methodNames }: Props) => {
  const { formatMessage } = useIntl();

  const text =
    methodNames.length === 1
      ? formatMessage(messages.actionRequiresVerificationUsingMethod, {
          method: methodNames[0],
        })
      : formatMessage(messages.actionRequiresVerificationUsingOneOf);

  return (
    <BlueShieldWarning icon="shield-checkered" mb="24px">
      {text}
    </BlueShieldWarning>
  );
};

export default VerificationWarning;
