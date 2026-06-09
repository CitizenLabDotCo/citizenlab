import React, { memo } from 'react';

import {
  Spinner,
  Text,
  colors,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { TVerificationMethod } from 'api/id_methods/types';
import useVerificationMethods from 'api/id_methods/useVerificationMethods';

import useCopenhagenPlatformCheck from 'hooks/useCopenhagenPlatformCheck';

import Outlet from 'components/Outlet';
import Centerer from 'components/UI/Centerer';

import SSOVerificationButtons, {
  isCentralizedSSOMethod,
} from './SSOVerificationButtons';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 28px;
  background: ${colors.background};
  border-radius: ${(props) => props.theme.borderRadius};
  max-width: 650px;

  ${media.phone`
    padding: 14px;
  `}
`;

interface Props {
  onMethodSelected: (selectedMethod: TVerificationMethod) => void;
  onSkipped?: () => void;
}

const VerificationMethods = memo<Props>(({ onMethodSelected }) => {
  const { data: verificationMethods } = useVerificationMethods();
  const isCopenhagenPlatform = useCopenhagenPlatformCheck();

  const handleOnMethodSelected = (method: TVerificationMethod) => {
    onMethodSelected(method);
  };

  if (verificationMethods === undefined) {
    return (
      <Centerer height="250px">
        <Spinner />
      </Centerer>
    );
  }

  return (
    <Container id="e2e-verification-wizard-method-selection-step">
      {/*
          Custom message for Copenhagen.
        To be replaced by sturdier solution if more similar requests are made.

        Ticket: CL-4042
        */}
      {isCopenhagenPlatform && (
        <Text mb="40px">
          For at stemme på københavnerforslag, skal du være MitID-verificeret
          borger i Københavns Kommune og fyldt 15 år. Hvis du vil stille et
          københavnerforslag, skal du være MitID-verificeret borger i Danmark og
          fyldt 15 år.
        </Text>
      )}
      <ButtonsContainer>
        {/* SSO verification methods are rendered centrally; the remaining
            form-based manual methods are still rendered by their own modules
            through the outlet below. */}
        <SSOVerificationButtons
          verificationMethods={verificationMethods.data}
          onClick={handleOnMethodSelected}
        />
        <Outlet
          id="app.components.VerificationModal.buttons"
          onClick={handleOnMethodSelected}
          verificationMethods={verificationMethods.data.filter(
            (method) =>
              method.attributes.verification_method &&
              !isCentralizedSSOMethod(method)
          )}
        />
      </ButtonsContainer>
    </Container>
  );
});

export default VerificationMethods;
