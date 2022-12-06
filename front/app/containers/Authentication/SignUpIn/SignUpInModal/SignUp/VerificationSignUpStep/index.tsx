import React from 'react';
import { ISignUpInMetaData } from 'events/openSignUpInModal';
import { trackEventByName } from 'utils/analytics';
import VerificationSteps from './VerificationSteps';
import tracks from './tracks';

interface Props {
  metaData: ISignUpInMetaData;
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
      context={metaData?.verificationContext || null}
      initialActiveStep="method-selection"
      inModal={true}
      showHeader={false}
      skippable={true}
    />
  );
};

export default VerificationSignUpStep;
