import React, { memo, useCallback, useState, useEffect } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

// components
import { IconNames } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Consent from './Consent';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';

// typings
import { SignUpInFlow } from 'containers/Authentication/typings';
import { AuthProvider } from '.';

const tracks = {
  signInWithSSOClicked: 'Sign in with SSO button clicked',
  signUpWithSSOClicked: 'Sign up with SSO button clicked',
};

const timeout = 300;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ccc;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);
  background: #fff;
  transition: all 100ms ease-out;

  &:hover {
    border-color: ${darken(0.3, '#ccc')};
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
  }
`;

const ConsentWrapper = styled.div`
  opacity: 0;
  max-height: 0px;
  overflow: hidden;
  background: transparent;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &.consent-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;

    &.consent-enter-active {
      opacity: 1;
      max-height: 300px;
      overflow: hidden;
    }
  }

  &.consent-enter-done {
    opacity: 1;
    max-height: none;
    overflow: visible;
  }

  &.consent-exit {
    opacity: 1;
    max-height: 300px;
    overflow: hidden;

    &.consent-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
    }
  }

  &.consent-exit-done {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
  }
`;

const ConsentWrapperInner = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  padding-top: 20px;
`;

const ContinueButton = styled(Button)``;

export type TOnContinueFunction = (authProvider: AuthProvider) => void;

export interface Props {
  id?: string;
  icon?: IconNames;
  flow: SignUpInFlow;
  authProvider: AuthProvider;
  className?: string;
  onContinue: TOnContinueFunction;
  children: React.ReactNode;
  showConsentOnFlow?: SignUpInFlow;
}

const AuthProviderButton = memo<Props>(
  ({
    flow,
    authProvider,
    className,
    onContinue,
    children,
    id,
    icon,
    showConsentOnFlow = 'signup',
  }) => {
    const [expanded, setExpanded] = useState(false);
    const [tacAccepted, setTacAccepted] = useState(false);
    const [tacError, setTacError] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [privacyError, setPrivacyError] = useState(false);

    useEffect(() => {
      // reset
      setTacAccepted(false);
      setTacError(false);
      setPrivacyAccepted(false);
      setPrivacyError(false);
    }, [expanded]);

    const handleExpandButtonClicked = useCallback(
      (event: React.FormEvent) => {
        event.preventDefault();

        if (showConsentOnFlow === flow && authProvider !== 'email') {
          setExpanded((prevExpanded) => !prevExpanded);
        } else {
          trackEventByName(tracks.signInWithSSOClicked, { authProvider });
          onContinue(authProvider);
        }
      },
      [flow, authProvider, onContinue, showConsentOnFlow]
    );

    const handleContinueClicked = useCallback(() => {
      if (!tacAccepted && authProvider !== 'id_vienna_saml') {
        setTacError(true);
      }

      if (!privacyAccepted && authProvider !== 'id_vienna_saml') {
        setPrivacyError(true);
      }

      if (
        (tacAccepted && privacyAccepted) ||
        authProvider === 'id_vienna_saml'
      ) {
        trackEventByName(tracks.signUpWithSSOClicked, { authProvider });
        onContinue(authProvider);
      }
    }, [authProvider, onContinue, tacAccepted, privacyAccepted]);

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

    const isContinueEnabled =
      authProvider === 'id_vienna_saml' || (tacAccepted && privacyAccepted);

    return (
      <Container className={className} id={id}>
        <Button
          icon={icon}
          iconSize="22px"
          iconColor={
            authProvider === 'facebook' ? colors.facebook : colors.textPrimary
          }
          buttonStyle="white"
          fullWidth={true}
          justify="left"
          whiteSpace="wrap"
          onClick={handleExpandButtonClicked}
          padding="10px 18px"
        >
          {children}
        </Button>

        {showConsentOnFlow === flow && (
          <CSSTransition
            classNames="consent"
            in={expanded}
            timeout={timeout}
            mounOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
          >
            <ConsentWrapper>
              <ConsentWrapperInner>
                <Consent
                  termsAndConditionsAccepted={tacAccepted}
                  privacyPolicyAccepted={privacyAccepted}
                  termsAndConditionsError={tacError}
                  privacyPolicyError={privacyError}
                  onTacAcceptedChange={handleTacAcceptedChange}
                  onPrivacyAcceptedChange={handlePrivacyAcceptedChange}
                  isViennaAuth={authProvider === 'id_vienna_saml'}
                />
                <ButtonWrapper>
                  <ContinueButton
                    onClick={handleContinueClicked}
                    disabled={!isContinueEnabled}
                  >
                    <FormattedMessage {...messages.continue} />
                  </ContinueButton>
                </ButtonWrapper>
              </ConsentWrapperInner>
            </ConsentWrapper>
          </CSSTransition>
        )}
      </Container>
    );
  }
);

export default AuthProviderButton;
