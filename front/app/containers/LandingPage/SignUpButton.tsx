import React, { MouseEvent, KeyboardEvent } from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import BannerButton from './BannerButton';
import { ButtonStyles } from 'components/UI/Button';

interface Props {
  signUpIn: (event: MouseEvent | KeyboardEvent) => void;
  buttonStyle: ButtonStyles | undefined;
}

const SignUpButton = ({ signUpIn, buttonStyle }: Props) => (
  <BannerButton
    buttonStyle={buttonStyle}
    onClick={signUpIn}
    text={<FormattedMessage {...messages.createAccount} />}
    className="e2e-signed-out-header-cta-button"
  />
);

export default SignUpButton;
