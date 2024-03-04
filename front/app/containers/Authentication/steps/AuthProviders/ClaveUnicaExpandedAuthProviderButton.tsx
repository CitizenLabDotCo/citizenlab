import React, { memo, useCallback, useState } from 'react';

import { fontSizes } from '@citizenlab/cl2-component-library';
import { SignUpInFlow } from 'containers/Authentication/typings';
import styled from 'styled-components';

// move to core
import ClaveUnicaButton from 'components/UI/ClaveUnicaButton';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import {
  TVerificationMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';
import useVerificationMethods from 'api/verification_methods/useVerificationMethods';

import Consent from './Consent';
import messages from './messages';

import { AuthProvider } from '.';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ccc;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);
  background: #fff;
  transition: all 100ms ease-out;
`;

const ConsentWrapperInner = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

export type TOnContinueFunction = (authProvider: AuthProvider) => void;

export interface Props {
  id?: string;
  flow: SignUpInFlow;
  className?: string;
  onSelectAuthProvider: TOnContinueFunction;
}

const ClaveUnicaExpandedAuthProviderButton = memo<Props>(
  ({ flow, className, id, onSelectAuthProvider }) => {
    const [tacAccepted, setTacAccepted] = useState(false);
    const [tacError, setTacError] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [privacyError, setPrivacyError] = useState(false);
    const showConsent = flow === 'signup';
    const { formatMessage } = useIntl();
    const { data: verificationMethods } = useVerificationMethods();

    const handleTacAcceptedChange = useCallback((tacAccepted: boolean) => {
      setTacAccepted(tacAccepted);
      setTacError(false);
    }, []);

    const handlePrivacyAcceptedChange = useCallback(
      (privacyAccepted: boolean) => {
        setPrivacyAccepted(privacyAccepted);
        setPrivacyError(false);
      },
      []
    );

    const handleOnClaveUnicaSelected = useCallback(
      (_method: TVerificationMethod) => {
        onSelectAuthProvider('clave_unica');
      },
      [onSelectAuthProvider]
    );

    if (isNilOrError(verificationMethods)) return null;

    const verificationMethodName: TVerificationMethodName = 'clave_unica';
    const claveUnicaMethod = verificationMethods.data.find(
      (vm) => vm.attributes.name === verificationMethodName
    );
    if (!claveUnicaMethod) return null;

    return (
      <Container className={className} id={id}>
        <div
          style={{
            padding: '10px 18px',
            fontSize: `${fontSizes.base}px`,
          }}
        >
          <ClaveUnicaButton
            last={false}
            method={claveUnicaMethod}
            onClick={handleOnClaveUnicaSelected}
            message={formatMessage(messages.continueWithLoginMechanism, {
              loginMechanismName: 'ClaveÚnica',
            })}
            disabled={showConsent && !(tacAccepted && privacyAccepted)}
          />
        </div>

        {showConsent && (
          <div>
            <ConsentWrapperInner>
              <Consent
                termsAndConditionsAccepted={tacAccepted}
                privacyPolicyAccepted={privacyAccepted}
                termsAndConditionsError={tacError}
                privacyPolicyError={privacyError}
                onTacAcceptedChange={handleTacAcceptedChange}
                onPrivacyAcceptedChange={handlePrivacyAcceptedChange}
                isViennaAuth={false}
              />
            </ConsentWrapperInner>
          </div>
        )}
      </Container>
    );
  }
);

export default ClaveUnicaExpandedAuthProviderButton;
