import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// components
import { Image } from '@citizenlab/cl2-component-library';

const LogoLink = styled(Link)`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Logo = styled(Image)`
  max-width: 100%;
  max-height: 44px;
  margin: 0;
  padding: 0px;
  cursor: pointer;
`;

const TenantLogo = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const tenantLogo = appConfiguration.data.attributes.logo?.medium;

    if (tenantLogo) {
      return (
        <LogoLink to="/" onlyActiveOnIndex={true}>
          <Logo src={tenantLogo} alt={formatMessage(messages.logoAltText)} />
        </LogoLink>
      );
    }
  }

  return null;
};

export default injectIntl(TenantLogo);
