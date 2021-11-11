import React, { MouseEvent, KeyboardEvent } from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import CTAButton from './CTAButton';

interface Props {
  signUpIn: (event: MouseEvent | KeyboardEvent) => void;
}

const SignUpButton = ({ signUpIn }: Props) => (
  <CTAButton
    onClick={signUpIn}
    text={<FormattedMessage {...messages.createAccount} />}
    className="e2e-signed-out-header-cta-button"
  />
);

export default SignUpButton;
