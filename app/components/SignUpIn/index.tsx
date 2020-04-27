import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resource hooks
import useTenant from 'hooks/useTenant';

// component
import SignUp from 'components/SignUpIn/SignUp';
import SignIn from 'components/SignUpIn/SignIn';

// styling
import styled from 'styled-components';

// typings
import { ProjectContext } from 'components/Verification/VerificationSteps';

const Container = styled.div``;

export type ISignUpInActionType = 'upvote' | 'downvote' | 'comment' | 'post';

export type ISignUpInActionContextType = 'idea' | 'initiative' | 'project' | 'phase';

export type TSignUpInFlow = 'signup' | 'signin';

export interface ISignUpInMetaData {
  flow: TSignUpInFlow;
  pathname: string;
  verification?: boolean;
  verificationContext?: ProjectContext;
  error?: boolean;
  isInvitation?: boolean;
  token?: string;
  inModal?: boolean;
  action?: () => void;
}

interface Props {
  metaData: ISignUpInMetaData;
  onSignUpInCompleted: (flow: TSignUpInFlow) => void;
  className?: string;
}

const SignUpIn = memo<Props>(({
  metaData,
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
            metaData={metaDataWithCurrentFlow}
            onSignUpCompleted={onSignUpCompleted}
            onGoToSignIn={onToggleSelectedMethod}
          />
        ) : (
          <SignIn
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
