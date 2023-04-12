import React from 'react';
import VerificationSteps from './VerificationSteps';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { AuthenticationData } from 'containers/NewAuthModal/typings';

interface Props {
  metaData: AuthenticationData;
  onCompleted: () => void;
  onError: () => void;
}

const VerificationSignUpStep = ({ metaData, onCompleted, onError }: Props) => {
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
      context={metaData?.context || null}
    />
  );
};

export default VerificationSignUpStep;
