import React from 'react';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import { useWindowSize, Box } from '@citizenlab/cl2-component-library';

// component
import SignUp from './SignUp';
import SignIn from './SignIn';

// styling
import { ContextShape } from 'components/Verification/verificationModalEvents';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { openSignUpInModal } from './events';

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
  onSignUpInCompleted: () => void;
  className?: string;
}

function getNewFlow(flow: TSignUpInFlow) {
  switch (flow) {
    case 'signup':
      return 'signin';
    case 'signin':
      return 'signup';
  }
}

const SignUpIn = ({
  metaData,
  customSignInHeader,
  customSignUpHeader,
  onSignUpInCompleted,
  className,
}: Props) => {
  const appConfiguration = useAppConfiguration();
  const { windowHeight } = useWindowSize();

  const onToggleSelectedMethod = () => {
    const flow = getNewFlow(metaData.flow);
    openSignUpInModal({
      ...metaData,
      flow,
    });
  };

  if (!isNilOrError(appConfiguration)) {
    return (
      <Box className={className}>
        {metaData.flow === 'signup' ? (
          <SignUp
            metaData={metaData}
            windowHeight={windowHeight}
            customHeader={customSignUpHeader}
            onSignUpCompleted={onSignUpInCompleted}
            onGoToSignIn={onToggleSelectedMethod}
          />
        ) : (
          <SignIn
            metaData={metaData}
            windowHeight={windowHeight}
            customHeader={customSignInHeader}
            onSignInCompleted={onSignUpInCompleted}
            onGoToSignUp={onToggleSelectedMethod}
          />
        )}
      </Box>
    );
  }

  return null;
};

export default SignUpIn;
