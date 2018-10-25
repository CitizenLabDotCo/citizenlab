import React from 'react';
import Link from 'utils/cl-router/Link';
import CSSTransition from 'react-transition-group/CSSTransition';

// components
import Checkbox from 'components/UI/Checkbox';

// styling
import styled from 'styled-components';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const timeout = 250;

const SocialSignUpButtonInner = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${timeout}ms ease-out;
  will-change: opacity;

  &.tac-enter {
    opacity: 0;
    position: absolute;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;

    &.tac-enter-active {
      opacity: 1;
    }
  }

  &.tac-exit {
    opacity: 1;

    &.tac-exit-active {
      opacity: 0;
    }
  }
`;

interface Props {
  loginProvider: 'google' | 'facebook' | 'azureactivedirectory';
  socialLoginClicked: 'google' | 'facebook' | 'azureactivedirectory' | null;
  tenantLoginMechanismName: string;
  socialLoginTaCAccepted: boolean;
  onCheck: () => void;
}

const TermsCheckbox = ({
  loginProvider,
  socialLoginClicked,
  socialLoginTaCAccepted,
  tenantLoginMechanismName,
  onCheck
}: Props) => {
  if (socialLoginClicked === loginProvider) {
    return (
      <CSSTransition classNames="tac" timeout={timeout} exit={true}>
        <SocialSignUpButtonInner>
          <Checkbox
            value={socialLoginTaCAccepted}
            onChange={onCheck}
            disableLabelClick={true}
            label={
              <FormattedMessage
                {...messages.acceptTermsAndConditions}
                values={{
                  tenantLoginMechanismName,
                  tacLink: <Link to="/pages/terms-and-conditions"><FormattedMessage {...messages.termsAndConditions} /></Link>
                }}
              />
            }
          />
        </SocialSignUpButtonInner>
      </CSSTransition>
    );
  }

  return null;
};

export default injectIntl<Props>(TermsCheckbox);
