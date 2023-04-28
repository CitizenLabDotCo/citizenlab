import React from 'react';
import VerificationSteps from './VerificationSteps';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { AuthenticationData } from 'containers/Authentication/typings';

interface Props {
  authenticationData: AuthenticationData;
  onCompleted: () => void;
  onError: () => void;
}

const VerificationSignUpStep = ({
  authenticationData,
  onCompleted,
  onError,
}: Props) => {
  const handleOnCompleted = () => {
    trackEventByName(tracks.signUpVerificationStepCompleted);
    onCompleted();
  };

  const handleOnError = () => {
    trackEventByName(tracks.signUpVerificationStepFailed);
    onError();
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
