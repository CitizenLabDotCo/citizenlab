import React, { memo,  useCallback, useState } from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './SignUp/messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { TSignUpInFlow } from 'components/SignUpIn';
import { AuthProvider } from './AuthProviders';

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

const ToC = styled.div`
  padding: 40px;
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

  const handleOnClick = useCallback((event: React.FormEvent) => {
    event.preventDefault();

    if (flow === 'signup' && authProvider !== 'email') {
      setExpanded(prevExpanded => !prevExpanded);
    } else {
      onContinue(authProvider);
    }
  }, [flow, onContinue]);

  const handleOnContinue = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    onContinue(authProvider);
  }, [authProvider, onContinue]);

  return (
    <Container
      className={className}
      // tabIndex={status === 'image' ? 0 : -1}
      // onClick={status === 'image' ? this.handleOnClick : undefined}
      // onKeyDown={status === 'image' ? this.handleOnKeyDown : undefined}
      // role={status === 'image' ? 'button' : ''}
    >

      {/*
      <Button>
        <StyledIcon name={authProvider as any} />
        <Text>
          {authProvider === 'email' && <FormattedMessage {...messages.continueWithEmail} />}
          {authProvider === 'google' && <FormattedMessage {...messages.continueWithGoogle} />}
          {authProvider === 'facebook' && <FormattedMessage {...messages.continueWithFacebook} />}
          {authProvider === 'azureactivedirectory' && <FormattedMessage {...messages.continueWithAzure} />}
        </Text>
      </Button>
      */}

      <Button
        icon={authProvider as any}
        iconSize="22px"
        buttonStyle="white"
        fullWidth={true}
        justify="left"
        whiteSpace="wrap"
        borderColor="transparent"
        borderHoverColor="transparent"
        onClick={handleOnClick}
      >
        {children}
      </Button>
      {expanded &&
        <ToC>
          dsafdsdsfdsdfdsf
          <Button onClick={handleOnContinue}>Continue</Button>
        </ToC>
      }
    </Container>
  );
});

export default AuthProviderButton;
