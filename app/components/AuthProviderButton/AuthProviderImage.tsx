import React from 'react';

// components
import { AuthProviderButtonInner } from './index';

// styling
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  logoUrl: string;
  logoHeight: string;
  timeout: number;
  providerName: string;
  altText: ReactIntl.FormattedMessage.MessageDescriptor;
}

const AuthProviderImage = (props: Props & InjectedIntlProps) => {
  const {
    logoUrl,
    logoHeight,
    timeout,
    providerName,
    altText,
  } = props;

  return (
    <CSSTransition classNames="tac" timeout={timeout} exit={true}>
      <AuthProviderButtonInner>
        <img
          src={logoUrl}
          height={logoHeight}
          alt={props.intl.formatMessage(altText, { loginMechanismName: providerName })}
        />
      </AuthProviderButtonInner>
    </CSSTransition>
  );

};

export default injectIntl<Props>(AuthProviderImage);
