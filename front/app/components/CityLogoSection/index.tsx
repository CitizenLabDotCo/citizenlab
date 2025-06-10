import React from 'react';

import { Image } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
  padding-left: 20px;
  padding-top: 50px;
  padding-bottom: 20px;
  background: #fff;
  width: 100%;
`;

const LogoLink = styled.a`
  cursor: pointer;
`;

const CityLogoSection = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();

  if (!isNilOrError(appConfiguration)) {
    const currentTenantLogo =
      appConfiguration.data.attributes.logo?.large || null;
    const tenantSite =
      appConfiguration.data.attributes.settings.core.organization_site;
    const localizedOrgName = localize(
      appConfiguration.data.attributes.settings.core.organization_name
    );

    if (currentTenantLogo) {
      const tenantImage = (
        <Image
          src={currentTenantLogo}
          alt={localizedOrgName}
          height="100px"
          marginBottom="20px"
        />
      );

      return (
        <Container id="hook-footer-logo">
          {tenantSite ? (
            <LogoLink href={tenantSite} target="_blank">
              {tenantImage}
            </LogoLink>
          ) : (
            <>{tenantImage}</>
          )}
        </Container>
      );
    }
  }

  return null;
};

export default CityLogoSection;
