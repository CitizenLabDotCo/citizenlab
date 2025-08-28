import React from 'react';

import { fontSizes, Box, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import AuthProviderButton, {
  TOnContinueFunction,
} from 'containers/Authentication/steps/_components/AuthProviderButton';
import { SignUpInFlow } from 'containers/Authentication/typings';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ViennaIcon from './ViennaIcon';

const Container = styled(Box)`
  display: flex;
  gap: 12px;
`;

const TextContainer = styled(Box)`
  display: flex;
  gap: 4px;
  flex-direction: column;
`;

const SignUpSubHeader = styled(Text)`
  font-size: ${fontSizes.s}px;
`;

interface Props {
  flow: SignUpInFlow;
  onContinue: TOnContinueFunction;
}

const ViennaSamlButton = ({ onContinue, flow }: Props) => {
  const handleOnContinue = () => {
    if (flow === 'signup') {
      window.location.href =
        'https://mein.wien.gv.at/Registrieren?branding=citizenlab';
    } else {
      onContinue('id_vienna_saml');
    }
  };
  return (
    <Box mb="18px">
      <AuthProviderButton
        authProvider="id_vienna_saml"
        onContinue={handleOnContinue}
        showConsent={flow === 'signin'}
      >
        <Container>
          <ViennaIcon />
          <TextContainer>
            <FormattedMessage
              {...(flow === 'signin'
                ? messages.signInWithStandardPortal
                : messages.signUpWithStandardPortal)}
            />

            {flow === 'signup' && (
              <SignUpSubHeader as="span">
                <FormattedMessage
                  {...messages.signUpWithStandardPortalSubHeader}
                />
              </SignUpSubHeader>
            )}
          </TextContainer>
        </Container>
      </AuthProviderButton>
    </Box>
  );
};

export default ViennaSamlButton;
