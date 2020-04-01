import React, { memo,  useCallback, useState, useEffect } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

// components
import Button from 'components/UI/Button';
import Consent from 'components/SignUpIn/SignUp/Consent';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { TSignUpInFlow } from 'components/SignUpIn';
import { AuthProvider } from './AuthProviders';

const timeout = 300;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.separation};

  &:hover {
    border-color: red;
  }
`;

const ConsentWrapper = styled.div`
  opacity: 0;
  display: none;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &.consent-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.consent-enter-active {
      opacity: 1;
      max-height: 200px;
      overflow: hidden;
      display: block;
    }
  }

  &.consent-enter-done {
    opacity: 1;
    overflow: visible;
    display: block;
  }

  &.consent-exit {
    opacity: 1;
    max-height: 200px;
    overflow: hidden;
    display: block;

    &.consent-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.consent-exit-done {
    display: none;
  }
`;

interface Props {
  flow: TSignUpInFlow;
  authProvider: AuthProvider;
  className?: string;
  onContinue: (authProvider: AuthProvider) => void;
  children: React.ReactNode;
}

const AuthProviderButton = memo<Props>(({ flow, authProvider, className, onContinue, children }) => {

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

  const handleExpandButtonClicked = useCallback((event: React.FormEvent) => {
    event.preventDefault();

    if (flow === 'signup' && authProvider !== 'email') {
      setExpanded(prevExpanded => !prevExpanded);
    } else {
      onContinue(authProvider);
    }
  }, [flow, authProvider, onContinue]);

  const handleContinueClicked = useCallback(() => {
    if (!tacAccepted) {
      setTacError(true);
    }

    if (!privacyAccepted) {
      setPrivacyError(true);
    }

    if (tacAccepted && privacyAccepted) {
      onContinue(authProvider);
    }
  }, [authProvider, onContinue, tacAccepted, privacyAccepted]);

  const handleTacAcceptedChange = useCallback((tacAccepted: boolean) => {
    setTacAccepted(tacAccepted);
    setTacError(false);
  }, []);

  const handlePrivacyAcceptedChange = useCallback((privacyAccepted: boolean) => {
    setPrivacyAccepted(privacyAccepted);
    setPrivacyError(false);
  }, []);

  return (
    <Container className={className}>
      <Button
        icon={authProvider as any}
        iconSize="22px"
        buttonStyle="white"
        fullWidth={true}
        justify="left"
        whiteSpace="wrap"
        borderColor="transparent"
        borderHoverColor="transparent"
        onClick={handleExpandButtonClicked}
      >
        {children}
      </Button>

      {flow === 'signup' &&
        <CSSTransition
          classNames="consent"
          in={expanded}
          timeout={timeout}
          mounOnEnter={false}
          unmountOnExit={false}
          enter={true}
          exit={true}
        >
          <ConsentWrapper>
            <Consent
              tacError={tacError}
              privacyError={privacyError}
              onTacAcceptedChange={handleTacAcceptedChange}
              onPrivacyAcceptedChange={handlePrivacyAcceptedChange}
            />
            <Button
              onClick={handleContinueClicked}
              disabled={!(tacAccepted && privacyAccepted)}
            >
              <FormattedMessage {...messages.continue} />
            </Button>
          </ConsentWrapper>
        </CSSTransition>
      }
    </Container>
  );
});

export default AuthProviderButton;
