import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resource hooks
import useTenant from 'hooks/useTenant';

// component
import SignUp, { InputProps as SignUpProps } from 'components/SignUpIn/SignUp';
import SignIn, { Props as SignInProps } from 'components/SignUpIn/SignIn';

// styling
import styled from 'styled-components';

const Container = styled.div``;

export type ISignUpInActionType = 'upvote' | 'downvote' | 'comment' | 'post';

export type ISignUpInActionContextType = 'idea' | 'initiative' | 'project' | 'phase';

export type TSignUpInFlow = 'signup' | 'signin';

export interface ISignUpInMetaData {
  flow: TSignUpInFlow;
  pathname: string;
  verification: boolean;
  action?: () => void;
}

interface Props extends Omit<SignUpProps, 'onGoToSignIn' | 'onSignUpCompleted' | 'initialActiveStep'>,  Omit<SignInProps, 'onGoToSignUp' | 'onSignInCompleted'> {
  onSignUpInCompleted: (flow: TSignUpInFlow) => void;
}

const SignUpIn = memo<Props>(({
  isInvitation,
  token,
  inModal,
  metaData,
  error,
  onSignUpInCompleted,
  className
}) => {
  const tenant = useTenant();

  const [selectedFlow, setSelectedFlow] = useState(metaData.flow || 'signup');

  const metaDataWithCurrentFlow = { ...metaData, flow: selectedFlow };

  const onSignUpCompleted = useCallback(() => {
    onSignUpInCompleted('signup');
  }, [onSignUpInCompleted]);

  const onSignInCompleted = useCallback(() => {
    onSignUpInCompleted('signin');
  }, [onSignUpInCompleted]);

  const onToggleSelectedMethod = useCallback(() => {
    setSelectedFlow(prevSelectedFlow => prevSelectedFlow === 'signup' ? 'signin' : 'signup');
  }, []);

  if (!isNilOrError(tenant)) {
    return (
      <Container className={className}>
        {selectedFlow === 'signup' ? (
          <SignUp
            inModal={inModal}
            isInvitation={isInvitation}
            token={token}
            metaData={metaDataWithCurrentFlow}
            error={error}
            onSignUpCompleted={onSignUpCompleted}
            onGoToSignIn={onToggleSelectedMethod}
          />
        ) : (
          <SignIn
            inModal={inModal}
            metaData={metaDataWithCurrentFlow}
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
