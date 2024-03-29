import React from 'react';

import {
  AuthenticationData,
  SetError,
} from 'containers/Authentication/typings';

import { trackEventByName } from 'utils/analytics';

import tracks from './tracks';
import VerificationSteps from './VerificationSteps';

interface Props {
  setError: SetError;
  onCompleted: () => void;
  authenticationData: AuthenticationData;
}

const VerificationSignUpStep = ({
  setError,
  onCompleted,
  authenticationData,
}: Props) => {
  const handleOnCompleted = () => {
    trackEventByName(tracks.signUpVerificationStepCompleted);
    onCompleted();
  };

  const handleOnError = () => {
    trackEventByName(tracks.signUpVerificationStepFailed);
    setError('unknown');
  };

  return (
    <VerificationSteps
      onCompleted={handleOnCompleted}
      onError={handleOnError}
      authenticationData={authenticationData}
    />
  );
};

export default VerificationSignUpStep;
