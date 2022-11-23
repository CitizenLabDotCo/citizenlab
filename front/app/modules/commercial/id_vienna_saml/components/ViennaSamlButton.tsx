import { AUTH_PATH } from 'containers/App/constants';
import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { TOnContinueFunction } from 'components/SignUpIn/AuthProviderButton';
import { StyledAuthProviderButton } from 'components/SignUpIn/AuthProviders';
import ViennaIcon from './ViennaIcon';

// typings
import { TSignUpInFlow } from 'events/openSignUpInModal';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import { Box, Text } from '@citizenlab/cl2-component-library';

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
  flow: TSignUpInFlow;
  onContinue: TOnContinueFunction;
}

const ViennaSamlButton = ({ onContinue, flow }: Props) => {
  const setHref = () => {
    window.location.href = `${AUTH_PATH}/vienna_citizen`;
  };
  const handleOnContinue = () => {
    if (flow === 'signup') {
      window.location.href =
        'https://mein.wien.gv.at/Registrieren?branding=citizenlab';
    } else {
      onContinue('id_vienna_saml', setHref);
    }
  };
  return (
    <StyledAuthProviderButton
      authProvider="id_vienna_saml"
      onContinue={handleOnContinue}
      flow={flow}
      showConsentOnFlow={'signin'}
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
    </StyledAuthProviderButton>
  );
};

export default ViennaSamlButton;
