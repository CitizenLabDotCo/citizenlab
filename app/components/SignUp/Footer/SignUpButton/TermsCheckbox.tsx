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
  loginMechanismName: string;
  socialLoginTaCAccepted: boolean;
  onCheck: () => void;
}

const TermsCheckbox = (props: Props & InjectedIntlProps) => {
  const {
    timeout,
    socialLoginTaCAccepted,
    loginMechanismName,
    onCheck
  } = props;

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
                  tacLink: <Link target="_blank" to="/pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link>
                }}
              />
            }
          />
        </SignUpButtonInner>
      </CSSTransition>
    );

};

export default injectIntl<Props>(TermsCheckbox);
