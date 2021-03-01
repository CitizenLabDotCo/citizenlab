import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useWindowSize from 'hooks/useWindowSize';

// component
import SignUp from 'components/SignUpIn/SignUp';
import SignIn from 'components/SignUpIn/SignIn';

// styling
import styled from 'styled-components';
import { ContextShape } from 'components/Verification/VerificationModal';

// typings

const Container = styled.div``;

export type ISignUpInActionType = 'upvote' | 'downvote' | 'comment' | 'post';

export type ISignUpInActionContextType =
  | 'idea'
  | 'initiative'
  | 'project'
  | 'phase';

export type TSignUpInFlow = 'signup' | 'signin';

export interface ISignUpInMetaData {
  flow: TSignUpInFlow;
  pathname: string;
  verification?: boolean;
  verificationContext?: ContextShape;
  error?: boolean;
  isInvitation?: boolean;
  token?: string;
  inModal?: boolean;
  noPushLinks?: boolean;
  noAutofocus?: boolean;
  action?: () => void;
}

interface Props {
  metaData: ISignUpInMetaData;
  customSignInHeader?: JSX.Element;
  customSignUpHeader?: JSX.Element;
  onSignUpInCompleted: (flow: TSignUpInFlow) => void;
  className?: string;
}

const SignUpIn = memo<Props>(
  ({
    metaData,
    customSignInHeader,
    customSignUpHeader,
    onSignUpInCompleted,
    className,
  }) => {
    const tenant = useAppConfiguration();
    const { windowHeight } = useWindowSize();

    const [selectedFlow, setSelectedFlow] = useState(metaData.flow || 'signup');

    const metaDataWithCurrentFlow = { ...metaData, flow: selectedFlow };

    const onSignUpCompleted = useCallback(() => {
      onSignUpInCompleted('signup');
    }, [onSignUpInCompleted]);

    const onSignInCompleted = useCallback(() => {
      onSignUpInCompleted('signin');
    }, [onSignUpInCompleted]);

    const onToggleSelectedMethod = useCallback(() => {
      setSelectedFlow((prevSelectedFlow) =>
        prevSelectedFlow === 'signup' ? 'signin' : 'signup'
      );
    }, []);

    if (!isNilOrError(tenant)) {
      return (
        <Container className={className}>
          {selectedFlow === 'signup' ? (
            <SignUp
              metaData={metaDataWithCurrentFlow}
              windowHeight={windowHeight}
              customHeader={customSignUpHeader}
              onSignUpCompleted={onSignUpCompleted}
              onGoToSignIn={onToggleSelectedMethod}
            />
          ) : (
            <SignIn
              metaData={metaDataWithCurrentFlow}
              windowHeight={windowHeight}
              customHeader={customSignInHeader}
              onSignInCompleted={onSignInCompleted}
              onGoToSignUp={onToggleSelectedMethod}
            />
          )}
        </Container>
      );
    }

    return null;
  }
);

export default SignUpIn;
