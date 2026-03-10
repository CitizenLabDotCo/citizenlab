import React, { useMemo } from 'react';

import { Image } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

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
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const tenantSite =
    appConfiguration?.data.attributes.settings.core.organization_site;
  const platformHost = appConfiguration?.data.attributes.host;
  const currentTenantLogo =
    appConfiguration?.data.attributes.logo?.large || null;
  const localizedOrgName = localize(
    appConfiguration?.data.attributes.settings.core.organization_name
  );

  const isExternalSite = useMemo(() => {
    if (!tenantSite) return false;
    try {
      return new URL(tenantSite).hostname !== platformHost;
    } catch {
      return true;
    }
  }, [tenantSite, platformHost]);

  if (isNilOrError(appConfiguration) || !currentTenantLogo) return null;

  const tenantImage = (
    <Image
      src={currentTenantLogo}
      alt={localizedOrgName}
      height="100px"
      marginBottom="20px"
      width="100%"
      objectFit="contain"
    />
  );

  return (
    <Container id="hook-footer-logo">
      {tenantSite ? (
        <LogoLink
          href={tenantSite}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={formatMessage(
            isExternalSite
              ? messages.logoLinkAriaLabelExternal
              : messages.logoLinkAriaLabelInternal
          )}
        >
          {tenantImage}
        </LogoLink>
      ) : (
        tenantImage
      )}
    </Container>
  );
};

export default CityLogoSection;
