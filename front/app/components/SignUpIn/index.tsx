import React from 'react';

// hooks
import { Box } from '@citizenlab/cl2-component-library';
import useAppConfiguration from 'hooks/useAppConfiguration';

// component
import SignIn from './SignIn';
import SignUp from './SignUp';

// styling
import { ContextShape } from 'components/Verification/verificationModalEvents';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { openSignUpInModal } from './events';

export type TSignUpInFlow = 'signup' | 'signin';

export type TSignUpInError = 'general' | 'franceconnect_merging_failed';
interface ISignUpInError {
  code: TSignUpInError;
}

export interface ISignUpInMetaData {
  flow: TSignUpInFlow;
  pathname: string;
  verification?: boolean;
  verificationContext?: ContextShape;
  error?: ISignUpInError;
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
  fullScreen?: boolean;
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
  fullScreen,
}: Props) => {
  const appConfiguration = useAppConfiguration();

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
            customHeader={customSignUpHeader}
            onSignUpCompleted={onSignUpInCompleted}
            onGoToSignIn={onToggleSelectedMethod}
            fullScreen={fullScreen}
          />
        ) : (
          <SignIn
            metaData={metaData}
            customHeader={customSignInHeader}
            onSignInCompleted={onSignUpInCompleted}
            onGoToSignUp={onToggleSelectedMethod}
            fullScreen={fullScreen}
          />
        )}
      </Box>
    );
  }

  return null;
};

export default SignUpIn;
