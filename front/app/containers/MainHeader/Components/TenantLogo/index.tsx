import React from 'react';

import { Image } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

const Logo = styled(Image)`
  max-width: 100%;
  max-height: 44px;
  margin: 0;
  padding: 0px;
  cursor: pointer;
`;

const TenantLogo = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();

  if (!isNilOrError(appConfiguration)) {
    const tenantLogo = appConfiguration.data.attributes.logo?.medium;

    if (tenantLogo) {
      return (
        <Link to="/" onlyActiveOnIndex={true}>
          <Logo src={tenantLogo} alt={formatMessage(messages.logoAltText)} />
        </Link>
      );
    }
  }

  return null;
};

export default TenantLogo;
