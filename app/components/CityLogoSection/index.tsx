import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';

// components
import Fragment from 'components/Fragment';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
} from 'services/appConfiguration';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
  padding-left: 20px;
  padding-top: 110px;
  padding-bottom: 130px;
  background: #fff;
  width: 100%;
`;

const LogoLink = styled.a`
  cursor: pointer;
`;

const TenantLogo = styled.img`
  height: 50px;
  margin-bottom: 20px;
`;

const TenantSlogan = styled.div`
  h2 {
    font-size: ${fontSizes.xxl}px;
    font-weight: 500;
    line-height: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }
  width: 100%;
  max-width: 340px;
  color: ${(props) => props.theme.colorText};
  text-align: center;
`;

interface Props {}

interface State {
  locale: Locale | null;
  currentTenant: IAppConfiguration | null;
}

class CityLogoSection extends PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      currentTenant: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      combineLatest(locale$, currentTenant$).subscribe(
        ([locale, currentTenant]) => {
          this.setState({ locale, currentTenant });
        }
      ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { locale, currentTenant } = this.state;
    const { formatMessage } = this.props.intl;

    if (locale && currentTenant) {
      const currentTenantLocales =
        currentTenant.data.attributes.settings.core.locales;
      const currentTenantLogo = currentTenant.data.attributes.logo
        ? currentTenant.data.attributes.logo.medium
        : false;
      const tenantSite =
        currentTenant.data.attributes.settings.core.organization_site;
      const organizationNameMulitiLoc =
        currentTenant.data.attributes.settings.core.organization_name;
      const currentTenantName = getLocalized(
        organizationNameMulitiLoc,
        locale,
        currentTenantLocales
      );
      const organizationType =
        currentTenant.data.attributes.settings.core.organization_type;
      const slogan = currentTenantName ? (
        <FormattedMessage
          tagName="h2"
          {...messages.slogan}
          values={{ name: currentTenantName, type: organizationType }}
        />
      ) : (
        ''
      );
      const footerLocale = `footer-city-logo-${locale}`;

      return (
        <Fragment
          title={formatMessage(messages.iframeTitle)}
          name={footerLocale}
        >
          <Container id="hook-footer-logo">
            {currentTenantLogo && tenantSite && (
              <LogoLink href={tenantSite} target="_blank">
                <TenantLogo src={currentTenantLogo} alt="Organization logo" />
              </LogoLink>
            )}

            {currentTenantLogo && !tenantSite && (
              <TenantLogo src={currentTenantLogo} alt="Organization logo" />
            )}

            <TenantSlogan>{slogan}</TenantSlogan>
          </Container>
        </Fragment>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(CityLogoSection);
