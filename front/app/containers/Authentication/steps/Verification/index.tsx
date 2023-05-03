import React from 'react';
import VerificationSteps from './VerificationSteps';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import {
  AuthenticationData,
  SetError,
} from 'containers/Authentication/typings';

interface Props {
  authenticationData: AuthenticationData;
  setError: SetError;
  onCompleted: () => void;
}

const VerificationSignUpStep = ({
  authenticationData,
  setError,
  onCompleted,
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
      context={authenticationData.context}
    />
  );
};

export default VerificationSignUpStep;
