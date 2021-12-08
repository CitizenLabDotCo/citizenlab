import React, { memo, useCallback } from 'react';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useWindowSize from 'hooks/useWindowSize';

// component
import SignUp from 'components/SignUpIn/SignUp';
import SignIn from 'components/SignUpIn/SignIn';

// styling
import styled from 'styled-components';
import { ContextShape } from 'components/Verification/verificationModalEvents';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { openSignUpInModal } from 'components/SignUpIn/events';

const Container = styled.div``;

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

function getNewFlow(flow: TSignUpInFlow) {
  if (flow === 'signup') return 'signin';
  if (flow === 'signin') return 'signup';

  return undefined;
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

    const onSignUpCompleted = useCallback(() => {
      onSignUpInCompleted('signup');
    }, [onSignUpInCompleted]);

    const onSignInCompleted = useCallback(() => {
      onSignUpInCompleted('signin');
    }, [onSignUpInCompleted]);

    const onToggleSelectedMethod = () => {
      const flow = getNewFlow(metaData.flow);
      openSignUpInModal({
        ...metaData,
        flow,
      });
    };

    if (!isNilOrError(tenant)) {
      return (
        <Container className={className}>
          {metaData.flow === 'signup' ? (
            <SignUp
              metaData={metaData}
              windowHeight={windowHeight}
              customHeader={customSignUpHeader}
              onSignUpCompleted={onSignUpCompleted}
              onGoToSignIn={onToggleSelectedMethod}
            />
          ) : (
            <SignIn
              metaData={metaData}
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
