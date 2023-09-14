import React from 'react';
import VerificationSteps from './VerificationSteps';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { SetError } from 'containers/Authentication/typings';

interface Props {
  setError: SetError;
  onCompleted: () => void;
}

const VerificationSignUpStep = ({ setError, onCompleted }: Props) => {
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
    />
  );
};

export default VerificationSignUpStep;
