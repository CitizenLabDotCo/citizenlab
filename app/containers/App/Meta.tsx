import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import Helmet from 'react-helmet';

// services
import { currentTenantStream, ITenant } from 'services/tenant';
import { localeStream } from 'services/locale';

// i18n
import messages from './messages';
import { getLocalized } from 'utils/i18n';
import { injectIntl, InjectedIntlProps } from 'react-intl';

type Props = {};

type State = {
  locale: string | null,
  currentTenant: ITenant | null;
};

class Meta extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];
  emailInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.state = {
      locale: null,
      currentTenant: null
    };
    this.subscriptions = [];
    this.emailInputElement = null;
  }

  componentWillMount() {
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
      const image = currentTenant.data.attributes.logo.large || '';
      const metaTitleMultiLoc = currentTenant.data.attributes.settings.core.meta_title;
      const organizationNameMultiLoc = currentTenant.data.attributes.settings.core.organization_name;
      const metaDescriptionMultiLoc = currentTenant.data.attributes.settings.core.meta_description;
      const metaTitle = getLocalized(metaTitleMultiLoc, locale, currentTenantLocales);
      const organizationName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);
      const metaDescription = getLocalized(metaDescriptionMultiLoc, locale, currentTenantLocales);
      const url = `http://${currentTenant.data.attributes.host}`;

      return (
        <Helmet>
          <title>{formatMessage(messages.helmetTitle)}</title>
          <meta property="og:title" content={metaTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:image" content={image} />
          <meta property="og:url" content={url} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:site_name" content={organizationName} />
        </Helmet>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(Meta);
