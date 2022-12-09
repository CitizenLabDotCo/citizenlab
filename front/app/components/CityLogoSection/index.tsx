import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Fragment from 'components/Fragment';
import { Image } from '@citizenlab/cl2-component-library';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

// style
import styled from 'styled-components';

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

interface Props {}

const CityLogoSection = ({
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const locale = useLocale();
  const appConfiguration = useAppConfiguration();
  const localize = useLocalize();

  if (!isNilOrError(appConfiguration)) {
    const currentTenantLogo = appConfiguration.attributes.logo?.large || null;
    const tenantSite =
      appConfiguration.attributes.settings.core.organization_site;
    const footerLocale = `footer-city-logo-${locale}`;
    const localizedOrgName = localize(
      appConfiguration.attributes.settings.core.organization_name
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
        <Fragment
          title={formatMessage(messages.iframeTitle)}
          name={footerLocale}
        >
          <Container id="hook-footer-logo">
            {tenantSite ? (
              <LogoLink href={tenantSite} target="_blank">
                {tenantImage}
              </LogoLink>
            ) : (
              <>{tenantImage}</>
            )}
          </Container>
        </Fragment>
      );
    }
  }

  return null;
};

export default injectIntl(CityLogoSection);
