import React from 'react';
import { AUTH_PATH } from 'containers/App/constants';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import { StyledAuthProviderButton } from 'components/SignUpIn/AuthProviders';
import { TOnContinueFunction } from 'components/SignUpIn/AuthProviderButton';
import ViennaIcon from './ViennaIcon';

// typings
import { TSignUpInFlow } from 'components/SignUpIn';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  gap: 2px;
  flex-direction: column;
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
      <ViennaIcon />
      <Container>
        <FormattedMessage
          {...(flow === 'signin'
            ? messages.signInWithStandardPortal
            : messages.signUpWithStandardPortal)}
        />

        {flow === 'signup' && (
          <SignUpSubHeader>
            <FormattedMessage {...messages.signUpWithStandardPortalSubHeader} />
          </SignUpSubHeader>
        )}
      </Container>
    </StyledAuthProviderButton>
  );
};

export default ViennaSamlButton;
