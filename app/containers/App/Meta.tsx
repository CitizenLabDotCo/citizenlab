import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// libraries
import Helmet from 'react-helmet';

// services
import { currentTenantStream, ITenant } from 'services/tenant';
import { localeStream } from 'services/locale';

// i18n
import messages from './messages';
import { getLocalized } from 'utils/i18n';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { Locale } from 'typings';

type Props = {};

type State = {
  locale: Locale | null,
  currentTenant: ITenant | null;
};

class Meta extends React.PureComponent<Props & InjectedIntlProps, State> {

  subscriptions: Rx.Subscription[];
  emailInputElement: HTMLInputElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null
    };
    this.subscriptions = [];
    this.emailInputElement = null;
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
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
    const { locale, currentTenant } = this.state;

    if (locale && currentTenant) {
      const { formatMessage } = this.props.intl;
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const image = currentTenant.data.attributes.header_bg.large || '';
      const metaTitleMultiLoc = currentTenant.data.attributes.settings.core.meta_title;
      const organizationNameMultiLoc = currentTenant.data.attributes.settings.core.organization_name;
      const metaDescriptionMultiLoc = currentTenant.data.attributes.settings.core.meta_description;
      let metaTitle = getLocalized(metaTitleMultiLoc, locale, currentTenantLocales);
      const organizationName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);
      let metaDescription = getLocalized(metaDescriptionMultiLoc, locale, currentTenantLocales);
      const url = `http://${currentTenant.data.attributes.host}`;
      const fbAppId = currentTenant.data.attributes.settings.facebook_login && currentTenant.data.attributes.settings.facebook_login.app_id;
      const currentTenantName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);
      const headerTitleMultiLoc = currentTenant.data.attributes.settings.core.header_title;
      const headerSloganMultiLoc = currentTenant.data.attributes.settings.core.header_slogan;
      const currentTenantHeaderTitle = (headerTitleMultiLoc && headerTitleMultiLoc[locale]);
      const currentTenantHeaderSlogan = (headerSloganMultiLoc && headerSloganMultiLoc[locale]);
      const helmetTitle = (currentTenantHeaderTitle ? currentTenantHeaderTitle : formatMessage(messages.helmetTitle, { name: currentTenantName }));
      const helmetDescription = (currentTenantHeaderSlogan ? currentTenantHeaderSlogan : formatMessage(messages.helmetDescription));

      metaTitle = (metaTitle || helmetTitle);
      metaDescription = (metaDescription || helmetDescription);

      return (
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:image" content={image} />
          <meta property="og:url" content={url} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="fb:app_id" content={fbAppId} />
          <meta property="og:site_name" content={organizationName} />
        </Helmet>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(Meta);
