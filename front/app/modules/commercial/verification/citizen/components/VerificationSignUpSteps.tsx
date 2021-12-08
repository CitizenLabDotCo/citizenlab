import React, { useEffect } from 'react';
import VerificationSteps from 'modules/commercial/verification/citizen/components/VerificationSteps';
import { SignUpStepOutletProps } from 'utils/moduleUtils';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import messages from './messages';
import { isNilOrError } from 'utils/helperUtils';

type Props = SignUpStepOutletProps;

const VerificationSignUpSteps = ({
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

export default VerificationSignUpSteps;
