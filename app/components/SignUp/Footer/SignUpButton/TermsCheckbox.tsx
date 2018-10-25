import React from 'react';
import Link from 'utils/cl-router/Link';
import CSSTransition from 'react-transition-group/CSSTransition';

// components
import Checkbox from 'components/UI/Checkbox';
import { SignUpButtonInner } from './index';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

interface Props {
  timeout: number;
  loginProvider: 'google' | 'facebook' | 'azureactivedirectory';
  socialLoginClicked: 'google' | 'facebook' | 'azureactivedirectory' | null;
  loginMechanismName: string;
  socialLoginTaCAccepted: boolean;
  onCheck: () => void;
}

const TermsCheckbox = (props: Props & InjectedIntlProps) => {
  const {
    timeout,
    loginProvider,
    socialLoginClicked,
    socialLoginTaCAccepted,
    loginMechanismName,
    onCheck
  } = props;

  if (socialLoginClicked === loginProvider) {
    return (
      <CSSTransition classNames="tac" timeout={timeout} exit={true}>
        <SignUpButtonInner>
          <Checkbox
            value={socialLoginTaCAccepted}
            onChange={onCheck}
            disableLabelClick={true}
            label={
              <FormattedMessage
                {...messages.acceptTermsAndConditions}
                values={{
                  loginMechanismName,
                  tacLink: <Link to="/pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link>
                }}
              />
            }
          />
        </SignUpButtonInner>
      </CSSTransition>
    );
  }

  return null;
};

export default injectIntl<Props>(TermsCheckbox);
