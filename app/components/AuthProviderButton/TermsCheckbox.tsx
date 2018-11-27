import React from 'react';
import Link from 'utils/cl-router/Link';
import CSSTransition from 'react-transition-group/CSSTransition';

// components
import Checkbox from 'components/UI/Checkbox';
import { AuthProviderButtonInner } from './index';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  timeout: number;
  providerName: string;
  accepted: boolean;
  onCheck: () => void;
  acceptText: ReactIntl.FormattedMessage.MessageDescriptor;
}

const TermsCheckbox = (props: Props & InjectedIntlProps) => {
  const {
    timeout,
    accepted,
    providerName,
    onCheck,
    acceptText,
  } = props;

return (
      <CSSTransition classNames="tac" timeout={timeout} exit={true}>
        <AuthProviderButtonInner>
          <Checkbox
            value={accepted}
            onChange={onCheck}
            disableLabelClick={true}
            label={
              <FormattedMessage
                {...acceptText}
                values={{
                  loginMechanismName: providerName,
                  tacLink: <Link target="_blank" to="/pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link>
                }}
              />
            }
          />
        </AuthProviderButtonInner>
      </CSSTransition>
    );

};

export default injectIntl<Props>(TermsCheckbox);
