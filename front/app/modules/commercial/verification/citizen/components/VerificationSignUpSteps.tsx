import React, { useEffect } from 'react';
import VerificationSteps from 'modules/commercial/verification/citizen/components/VerificationSteps';
import { SignUpStepOutletProps } from 'utils/moduleUtils';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import messages from './messages';

type Props = SignUpStepOutletProps & InjectedIntlProps;

const VerificationSignUpSteps = ({
  metaData,
  intl: { formatMessage },
  onCompleted,
  ...props
}: Props) => {
  useEffect(() => {
    props.onData({
      key: 'verification',
      configuration: {
        position: 4,
        stepName: formatMessage(messages.verifyYourIdentity),
        onSkipped: () => trackEventByName(tracks.signUpVerificationStepSkipped),
        onError: () => trackEventByName(tracks.signUpVerificationStepFailed),
        isEnabled: (metaData) => !!metaData?.verification,
        isActive: (authUser) => !authUser?.attributes?.verified,
      },
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

  return (
    <VerificationSteps
      {...props}
      onCompleted={handleOnCompleted}
      context={metaData?.verificationContext || null}
      initialActiveStep="method-selection"
      inModal={!!metaData.inModal}
      showHeader={false}
      skippable={true}
    />
  );
};

export default injectIntl(VerificationSignUpSteps);
