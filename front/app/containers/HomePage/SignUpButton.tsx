import React, { MouseEvent, KeyboardEvent } from 'react';
import messages from './messages';
import BannerButton, {
  BannerButtonStyle,
} from 'components/LandingPages/citizen/BannerButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

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
