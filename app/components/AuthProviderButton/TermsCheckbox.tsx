import React, { PureComponent } from 'react';
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

class TermsCheckbox extends PureComponent<Props & InjectedIntlProps> {

  handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  }

  render() {
    const {
      timeout,
      accepted,
      providerName,
      onCheck,
      acceptText,
    } = this.props;

  return (
    <CSSTransition classNames="tac" timeout={timeout} exit={true}>
      <AuthProviderButtonInner>
        <Checkbox
          checked={accepted}
          onChange={onCheck}
          label={
            <FormattedMessage
              {...acceptText}
              values={{
                loginMechanismName: providerName,
                tacLink: <Link
                  target="_blank"
                  to="/pages/terms-and-conditions"
                  onClick={this.handleLinkClick}
                >
                  <FormattedMessage {...messages.termsAndConditions} />
                </Link>
              }}
            />
          }
        />
      </AuthProviderButtonInner>
    </CSSTransition>
  );

  }
}

export default injectIntl<Props>(TermsCheckbox);
