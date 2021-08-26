import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

const Logo = styled.img`
  max-width: 100%;
  max-height: 44px;
  margin: 0;
  padding: 0px;
  cursor: pointer;
`;

interface Props {
  className?: string;
}

const TenantLogo = ({
  className,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const tenantLogo = appConfiguration.data.attributes.logo?.medium;

    if (tenantLogo) {
      return (
        <Logo
          className={className}
          src={tenantLogo}
          alt={formatMessage(messages.logoAltText)}
        />
      );
    }
  }

  return null;
};

export default injectIntl(TenantLogo);
