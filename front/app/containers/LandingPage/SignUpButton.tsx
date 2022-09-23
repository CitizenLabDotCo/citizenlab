import React, { KeyboardEvent, MouseEvent } from 'react';
import BannerButton, { BannerButtonStyle } from './BannerButton';
import messages from './messages';

// i18n
import { injectIntl, WrappedComponentProps } from 'react-intl';

interface Props {
  signUpIn: (event: MouseEvent | KeyboardEvent) => void;
  buttonStyle: BannerButtonStyle;
}

const SignUpButton = ({
  signUpIn,
  buttonStyle,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => (
  <BannerButton
    buttonStyle={buttonStyle}
    onClick={signUpIn}
    text={formatMessage(messages.createAccount)}
    className="e2e-signed-out-header-cta-button"
  />
);

export default injectIntl(SignUpButton);
