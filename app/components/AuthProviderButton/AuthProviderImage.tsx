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

const AuthProviderImage = ({
  logoUrl,
  logoHeight,
  timeout,
  providerName,
  altText,
  intl: { formatMessage }
}: Props & InjectedIntlProps) => {

  return (
    <CSSTransition classNames="tac" timeout={timeout} exit={true}>
      <AuthProviderButtonInner>
        <img
          src={logoUrl}
          height={logoHeight}
          alt={formatMessage(altText, { loginMechanismName: providerName })}
        />
      </AuthProviderButtonInner>
    </CSSTransition>
  );

};

export default injectIntl<Props>(AuthProviderImage);
