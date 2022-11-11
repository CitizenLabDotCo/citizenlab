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
import { TSignUpInFlow } from 'components/SignUpIn';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  gap: 10px;
`;

const TextContainer = styled.div`
  display: flex;
  gap: 2px;
  flex-direction: column;
`;

const StyledViennaIcon = styled(ViennaIcon)`
  flex-shrink: 0;
`;

const SignUpSubHeader = styled.span`
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
        <StyledViennaIcon />
        <TextContainer>
          <FormattedMessage
            {...(flow === 'signin'
              ? messages.signInWithStandardPortal
              : messages.signUpWithStandardPortal)}
          />

          {flow === 'signup' && (
            <SignUpSubHeader>
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
