import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resource hooks
import useTenant from 'hooks/useTenant';

// component
import SignUp, { InputProps as SignUpProps } from 'components/SignUp';
import SignIn, { InputProps as SignInProps } from 'components/SignIn';

// styling
import styled from 'styled-components';

const Container = styled.div``;

export type ISignUpInActionType = 'upvote' | 'downvote' | 'comment' | 'post';

export type ISignUpInActionContextType = 'idea' | 'initiative' | 'project' | 'phase';

export interface ISignUpInMetaData {
  method: TSignUpInMethods;
  pathname: string;
  verification: boolean;
  action?: () => void;
}

export type TSignUpInMethods = 'signup' | 'signin';

interface Props extends Omit<SignUpProps, 'onGoToSignIn' | 'onSignUpCompleted' | 'initialActiveStep'>,  Omit<SignInProps, 'onGoToSignUp' | 'onSignInCompleted'> {
  onSignUpInCompleted: (method: TSignUpInMethods) => void;
}

const SignUpIn = memo<Props>(({
  isInvitation,
  token,
  metaData,
  error,
  onSignUpInCompleted,
  className
}) => {
  const tenant = useTenant();

  const [activeMethod, setActiveMethod] = useState(metaData.method || 'signup');

  const onSignUpCompleted = useCallback(() => {
    onSignUpInCompleted('signup');
  }, [onSignUpInCompleted]);

  const onSignInCompleted = useCallback(() => {
    onSignUpInCompleted('signin');
  }, [onSignUpInCompleted]);

  const onToggleSelectedMethod = useCallback(() => {
    setActiveMethod(activeMethod => activeMethod === 'signup' ? 'signin' : 'signup');
  }, []);

  if (!isNilOrError(tenant)) {
    return (
      <Container className={className}>
        {activeMethod === 'signup' ? (
          <SignUp
            inModal={false}
            isInvitation={isInvitation}
            token={token}
            metaData={{ ...metaData, method: activeMethod }}
            error={error}
            onSignUpCompleted={onSignUpCompleted}
            onGoToSignIn={onToggleSelectedMethod}
          />
        ) : (
          <SignIn
            metaData={{ ...metaData, method: activeMethod }}
            onSignInCompleted={onSignInCompleted}
            onGoToSignUp={onToggleSelectedMethod}
          />
        )}
      </Container>
    );
  }

  return null;
});

export default SignUpIn;
