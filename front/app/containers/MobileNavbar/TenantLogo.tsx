import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

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

const TenantLogo = ({ className, localize }: Props & InjectedLocalized) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const tenantLogo = appConfiguration.data.attributes.logo?.medium;
    // just the org's name works fine as alt text for a11y purposes
    const localizedOrgName = localize(
      appConfiguration.data.attributes.settings.core.organization_name
    );

    if (tenantLogo) {
      return (
        <Logo
          aria-hidden
          className={className}
          src={tenantLogo}
          alt={localizedOrgName}
        />
      );
    }
  }

  return null;
};

export default injectLocalize(TenantLogo);
