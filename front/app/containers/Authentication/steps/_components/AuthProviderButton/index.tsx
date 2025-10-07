import React, { memo, useCallback, useState, useEffect } from 'react';

import { IconNames, colors } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled, { useTheme } from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import { AuthProvider } from '../../AuthProviders';
import messages from '../../AuthProviders/messages';

import Consent from './Consent';
import tracks from './tracks';

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

const ContinueButton = styled(ButtonWithLink)``;

export type TOnContinueFunction = (authProvider: AuthProvider) => void;

export interface Props {
  id?: string;
  icon?: IconNames;
  authProvider: AuthProvider;
  showConsent: boolean;
  onContinue: TOnContinueFunction;
  children: React.ReactNode;
}

const AuthProviderButton = memo<Props>(
  ({ id, icon, authProvider, showConsent, onContinue, children }) => {
    const [expanded, setExpanded] = useState(false);
    const [tacAccepted, setTacAccepted] = useState(false);
    const [tacError, setTacError] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [privacyError, setPrivacyError] = useState(false);
    const theme = useTheme();
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

        if (showConsent && authProvider !== 'email') {
          setExpanded((prevExpanded) => !prevExpanded);
        } else {
          trackEventByName(tracks.signInWithSSOClicked, { authProvider });
          onContinue(authProvider);
        }
      },
      [showConsent, authProvider, onContinue]
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
      <Container id={id}>
        <ButtonWithLink
          icon={icon}
          iconSize="22px"
          iconColor={
            authProvider === 'facebook'
              ? colors.facebook
              : theme.colors.tenantText
          }
          buttonStyle="white"
          fullWidth={true}
          justify="left"
          whiteSpace="wrap"
          onClick={handleExpandButtonClicked}
          padding="10px 18px"
          textColor={theme.colors.tenantText}
        >
          {children}
        </ButtonWithLink>

        {showConsent && (
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
                    className="e2e-sso-continue-button"
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
