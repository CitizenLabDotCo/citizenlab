import React from 'react';
import styled from 'styled-components';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { BoxProps, Image } from '@citizenlab/cl2-component-library';

const LogoLink = styled(Link)`
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

const TenantLogo = ({ ...props }: BoxProps) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();

  if (!isNilOrError(appConfiguration)) {
    const tenantLogo = appConfiguration.data.attributes.logo?.medium;

    if (tenantLogo) {
      return (
        <LogoLink
          to="/"
          onlyActiveOnIndex={true}
          style={{ flex: props.flex || '1 1 auto' }}
        >
          <Logo src={tenantLogo} alt={formatMessage(messages.logoAltText)} />
        </LogoLink>
      );
    }
  }

  return null;
};

export default TenantLogo;
