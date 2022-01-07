import React, { MouseEvent, KeyboardEvent } from 'react';
import messages from './messages';
import BannerButton from './BannerButton';
import { ButtonStyles } from 'components/UI/Button';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  signUpIn: (event: MouseEvent | KeyboardEvent) => void;
  buttonStyle: ButtonStyles;
}

const SignUpButton = ({
  signUpIn,
  buttonStyle,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => (
  <BannerButton
    buttonStyle={buttonStyle}
    onClick={signUpIn}
    text={formatMessage(messages.createAccount)}
    className="e2e-signed-out-header-cta-button"
  />
);

export default injectIntl(SignUpButton);
