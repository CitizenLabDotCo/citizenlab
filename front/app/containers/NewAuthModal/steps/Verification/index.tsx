import React from 'react';
import VerificationSteps from './VerificationSteps';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { AuthenticationData } from 'containers/NewAuthModal/typings';

interface Props {
  metaData: AuthenticationData;
  onCompleted: () => void;
  onSkipped: () => void;
  onError: () => void;
}

const VerificationSignUpStep = ({
  metaData,
  onCompleted,
  onSkipped,
  onError,
}: Props) => {
  const handleOnCompleted = () => {
    trackEventByName(tracks.signUpVerificationStepCompleted);
    onCompleted();
  };

  const handleOnSkipped = () => {
    trackEventByName(tracks.signUpVerificationStepSkipped);
    onSkipped();
  };

  const handleOnError = () => {
    trackEventByName(tracks.signUpVerificationStepFailed);
    onError();
  };

  return (
    <VerificationSteps
      onCompleted={handleOnCompleted}
      onSkipped={handleOnSkipped}
      onError={handleOnError}
      context={metaData?.context || null}
      initialActiveStep="method-selection"
      inModal={true}
      showHeader={false}
      skippable={true}
    />
  );
};

export default VerificationSignUpStep;
