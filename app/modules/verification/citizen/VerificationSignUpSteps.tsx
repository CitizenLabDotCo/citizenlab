import React, { useEffect } from 'react';
import VerificationSteps from 'components/Verification/VerificationSteps';
import { SignUpStepOutletProps } from 'utils/moduleUtils';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

type Props = SignUpStepOutletProps & InjectedIntlProps;

const VerificationSignUpSteps = ({ metaData, ...props }: Props) => {
  useEffect(() => {
    props.onData({
      key: 'verification',
      configuration: {
        position: 3,
        stepName: 'temp', //formatMessage(messages.verifyYourIdentity),
        onSkipped: () => trackEventByName(tracks.signUpVerificationStepSkipped),
        onError: () => trackEventByName(tracks.signUpVerificationStepFailed),
        onCompleted: () =>
          trackEventByName(tracks.signUpVerificationStepCompleted),
        isEnabled: (metaData) => !!metaData?.verification,
        isActive: (authUser) => !authUser?.attributes?.verified,
      },
    });
  }, []);

  if (props.step !== 'verification') {
    return null;
  }

  return (
    <VerificationSteps
      {...props}
      context={metaData?.verificationContext || null}
      initialActiveStep="method-selection"
      inModal={!!metaData.inModal}
      showHeader={false}
      skippable={true}
    />
  );
};

export default injectIntl(VerificationSignUpSteps);
