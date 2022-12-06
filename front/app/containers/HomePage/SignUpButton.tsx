import React, { MouseEvent, KeyboardEvent } from 'react';
import { WrappedComponentProps } from 'react-intl';
// i18n
import { injectIntl } from 'utils/cl-intl';
import BannerButton, {
  BannerButtonStyle,
} from 'components/LandingPages/citizen/BannerButton';
import messages from './messages';

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
