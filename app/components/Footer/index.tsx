import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import MediaQuery from 'react-responsive';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';

// components
import Fragment from 'components/Fragment';
import ShortFeedback from './ShortFeedback';
import SendFeedback from 'components/SendFeedback';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { LEGAL_PAGES } from 'services/pages';

// typings
import { Locale } from 'typings';

import eventEmitter from 'utils/eventEmitter';
import {
  Container,
  FirstLine,
  LogoLink,
  TenantLogo,
  TenantSlogan,
  SecondLine,
  PagesNav,
  Separator,
  StyledLink,
  StyledButton,
  Right,
  PoweredBy,
  CitizenlabLink,
  PoweredByText,
  CitizenlabName,
  CitizenlabLogo,
  SendFeedback,
  SendFeedbackText,
  SendFeedbackIcon
 } from './StyledComponents';
import { viewportWidths } from 'utils/styleUtils';

const openConsentManager = () => eventEmitter.emit('footer', 'openConsentManager', null);

interface InputProps {
  showCityLogoSection?: boolean | undefined;
}

interface Props extends InputProps { }

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  showCityLogoSection: boolean;
};

class Footer extends PureComponent<Props & InjectedIntlProps, State> {
  static displayName = 'Footer';
  subscriptions: Subscription[];

  static defaultProps = {
    showCityLogoSection: true
  };

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      currentTenant: null,
      showCityLogoSection: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.setState({ showCityLogoSection: !!this.props.showCityLogoSection });

    this.subscriptions = [
      combineLatest(
        locale$,
        currentTenant$
      ).subscribe(([locale, currentTenant]) => {
        this.setState({ locale, currentTenant });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { locale, currentTenant, showCityLogoSection } = this.state;
    const { formatMessage } = this.props.intl;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const currentTenantLogo = currentTenant.data.attributes.logo.medium;
      const tenantSite = currentTenant.data.attributes.settings.core.organization_site;
      const organizationNameMulitiLoc = currentTenant.data.attributes.settings.core.organization_name;
      const currentTenantName = getLocalized(organizationNameMulitiLoc, locale, currentTenantLocales);
      const organizationType = currentTenant.data.attributes.settings.core.organization_type;
      const slogan = currentTenantName ? <FormattedMessage {...messages.slogan} values={{ name: currentTenantName, type: organizationType }} /> : '';
      const poweredBy = <FormattedMessage {...messages.poweredBy} />;
      const footerLocale = `footer-city-logo-${locale}`;
      const whiteBg = (showCityLogoSection || (location.pathname.replace(/\/$/, '') === `/${locale}`));

      return (
        <Container role="contentinfo" className={this.props['className']} id="hook-footer">
          {showCityLogoSection &&
            <Fragment title={formatMessage(messages.iframeTitle)} name={footerLocale}>
              <FirstLine id="hook-footer-logo">
                {currentTenantLogo && tenantSite &&
                  <LogoLink href={tenantSite} target="_blank">
                    <TenantLogo src={currentTenantLogo} alt="Organization logo" />
                  </LogoLink>}
                {currentTenantLogo && !tenantSite &&
                  <TenantLogo src={currentTenantLogo} alt="Organization logo" />}
                <TenantSlogan>{slogan}</TenantSlogan>
              </FirstLine>
            </Fragment>
          }

          <SecondLine>
            <ShortFeedback />
            <PagesNav>
              <ul>
                {LEGAL_PAGES.map((slug) => (
                  <li key={slug}>
                    <StyledLink to={`/pages/${slug}`}>
                      <FormattedMessage {...messages[slug]} />
                    </StyledLink>
                  </li>
                ))}
                <li>
                  <StyledButton onClick={openConsentManager}>
                    <FormattedMessage {...messages.cookieSettings} />
                  </StyledButton>
                </li>
              </ul>
            </PagesNav>

            <Right>
              <PoweredBy>
                <PoweredByText>{poweredBy}</PoweredByText>
                <CitizenlabLink href="https://www.citizenlab.co/">
                  <CitizenlabName>CitizenLab</CitizenlabName>
                  <CitizenlabLogo height="100%" viewBox="0 1 140.753 27.002" alt="CitizenLab">
                    <path d="M21.35 1.004h-5.482c-.388 0-.815 0-1.272-.002-1.226-.002-2.618-.005-4.114.006-1.28.01-2.575.005-3.718 0-.584 0-1.134-.003-1.628-.003H0v8.233c0 3.633.488 6.853 1.452 9.573.805 2.27 1.942 4.206 3.38 5.75l.183.192.024.025c.592.61 1.24 1.156 1.92 1.625l.02.014c.063.043.124.084.19.126.026.02.054.035.08.054l.067.04.018.013c1.546.975 2.775 1.24 2.91 1.267l.43.086.432-.086c.135-.027.858-.19 1.86-.682 1.276-.63 2.504-1.557 3.55-2.683 1.438-1.545 2.575-3.48 3.38-5.75.963-2.718 1.452-5.936 1.452-9.566v-.153c.005-1.52.003-2.737 0-3.715V4.33c0-.978 0-1.518.004-2.08l-.004-1.246zM2.513 3.534H9.43v2.74l-2.534 2.55H2.513v-5.29zm6.916 21.4c-.256-.127-.51-.27-.758-.428l-.016-.01-.05-.03c-.022-.017-.045-.03-.065-.044-.05-.03-.097-.064-.145-.098l-.02-.014c-.545-.375-1.064-.814-1.543-1.306l-.018-.02c-.05-.05-.1-.104-.15-.155-1.2-1.29-2.157-2.93-2.845-4.87-.68-1.92-1.1-4.157-1.248-6.648h4.325l2.532 2.55v11.072zm1.235-13.347l-1.508-1.52 1.51-1.52 1.508 1.52-1.51 1.52zm6.866 6.366c-.687 1.94-1.645 3.58-2.845 4.87-.83.892-1.79 1.622-2.78 2.12v-11.08l2.532-2.55h4.34c-.147 2.488-.566 4.72-1.246 6.64zm1.303-9.214H14.43l-2.532-2.55V3.533h6.94v.125c0 .863.003 2.632-.005 5.08zM32.558 20.5c-1.864 0-3.453-1.38-3.453-3.838 0-2.457 1.562-3.81 3.425-3.81h.002c1.81 0 2.658 1.16 2.987 2.29l3.26-1.102c-.576-2.29-2.66-4.583-6.33-4.583-3.92 0-6.99 3.01-6.99 7.205 0 4.168 3.125 7.205 7.1 7.205 3.59 0 5.7-2.32 6.302-4.583l-3.207-1.076c-.3 1.05-1.233 2.292-3.097 2.292zM41 9.87h3.646v13.583H41zM42.808 3.137c-1.233-.002-2.246 1.02-2.246 2.29 0 1.215 1.014 2.236 2.246 2.236 1.26 0 2.248-1.02 2.248-2.236 0-1.27-.987-2.29-2.248-2.29zM52.484 5.814h-3.29v1.904c0 1.215-.658 2.153-2.08 2.153h-.688v3.26h2.44v6.32c0 2.624 1.644 4.196 4.275 4.196 1.07 0 1.728-.192 2.057-.33V20.28c-.192.054-.685.11-1.124.11-1.04 0-1.59-.39-1.59-1.576V13.13h2.714V9.87h-2.713V5.814zM57.743 23.453h3.646V9.87h-3.647M59.554 3.137c-1.233-.002-2.247 1.02-2.247 2.29 0 1.215 1.013 2.236 2.246 2.236 1.26 0 2.248-1.02 2.248-2.236 0-1.27-.985-2.29-2.246-2.29zM68.268 20.25l6.578-7.314V9.872h-10.88v3.174h6.22L63.8 20.223v3.23h11.154V20.25M82.9 9.457c-3.45 0-6.63 2.816-6.63 7.15 0 4.582 3.26 7.26 6.958 7.26 3.316 0 5.455-1.96 6.14-4.307l-3.04-.91c-.44 1.214-1.37 2.07-3.07 2.07-1.808 0-3.316-1.298-3.398-3.094h9.646c0-.054.055-.605.055-1.13 0-4.36-2.494-7.04-6.66-7.04zm-2.96 5.66c.085-1.243 1.126-2.678 3.016-2.68 2.083 0 2.96 1.327 3.017 2.68H79.94zM99.318 9.513c-1.452 0-3.07.635-3.89 2.042V9.87H91.89v13.583h3.646V15.64h-.002c0-1.572.93-2.814 2.52-2.814 1.755 0 2.495 1.187 2.495 2.705v7.924h3.647v-8.557c0-2.983-1.535-5.384-4.88-5.384zM107.594 3.467h2.576v19.986h-2.576zM124.338 14.62c0-2.594-1.533-4.86-5.48-4.86-2.85 0-5.125 1.767-5.4 4.307l2.468.58c.164-1.546 1.177-2.677 2.987-2.677 2 0 2.85 1.076 2.85 2.373 0 .47-.22.884-1.014.994l-3.565.524c-2.272.33-4 1.657-4 4.032 0 2.098 1.728 3.975 4.412 3.975 2.358 0 3.674-1.27 4.248-2.207 0 .966.082 1.463.14 1.793h2.52c-.056-.33-.165-1.02-.165-2.18V14.62zm-2.576 3.146c0 2.9-1.697 3.92-3.808 3.92-1.315 0-2.14-.938-2.14-1.933 0-1.188.824-1.82 1.918-1.987l4.03-.606v.606zM134.697 9.788c-2.193 0-3.727 1.077-4.357 2.264V3.467h-2.55v19.986h2.55V21.52c.823 1.436 2.33 2.292 4.273 2.292 3.92 0 6.14-3.12 6.14-7.067 0-3.865-2.056-6.957-6.056-6.957zm-.467 11.705c-2.274 0-3.918-1.878-3.918-4.748s1.644-4.665 3.918-4.665c2.385 0 3.892 1.795 3.892 4.665s-1.534 4.748-3.892 4.748z" />
                  </CitizenlabLogo>
                </CitizenlabLink>
              </PoweredBy>

              <MediaQuery minWidth={viewportWidths.smallTablet}>
                {matches => <SendFeedback showFeedbackText={!matches} />}
              </MediaQuery>
            </Right>
          </SecondLine>
        </Container>
      );
    }

    return null;
  }
}

const WrappedFooter = injectIntl(Footer);
Object.assign(WrappedFooter).displayName = 'WrappedFooter';

export default WrappedFooter;
