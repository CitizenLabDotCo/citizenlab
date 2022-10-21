import VerificationSteps from 'modules/commercial/verification/citizen/components/VerificationSteps';
import React, { useEffect } from 'react';
import { trackEventByName } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';
import { SignUpStepOutletProps } from 'utils/moduleUtils';
import messages from './messages';
import tracks from './tracks';

type Props = SignUpStepOutletProps;

const VerificationSignUpStep = ({
  metaData,
  onCompleted,
  onSkipped,
  onError,
  ...props
}: Props) => {
  useEffect(() => {
    props.onData({
      key: 'verification',
      position: 5,
      stepDescriptionMessage: messages.verifyYourIdentity,
      isEnabled: (_, metaData) => !!metaData.verification,
      isActive: (authUser, metaData) => {
        if (isNilOrError(authUser)) return false;
        const flowHasVerificationStep = !!metaData.verification;
        return flowHasVerificationStep && !authUser.attributes.verified;
      },
      canTriggerRegistration: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (props.step !== 'verification') {
    return null;
  }

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
      {...props}
      onCompleted={handleOnCompleted}
      onSkipped={handleOnSkipped}
      onError={handleOnError}
      context={metaData?.verificationContext || null}
      initialActiveStep="method-selection"
      inModal={!!metaData.inModal}
      showHeader={false}
      skippable={true}
    />
  );
};

export default VerificationSignUpStep;
