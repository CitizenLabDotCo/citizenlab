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
import i18n from 'utils/i18n';
import { injectIntl, InjectedIntlProps } from 'react-intl';

type Props = {};

type State = {
  currentTenant: ITenant | null;
};

class Meta extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];
  emailInputElement: HTMLInputElement | null;

  constructor() {
    super();
    this.state = {
      currentTenant: null
    };
    this.subscriptions = [];
    this.emailInputElement = null;
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe(currentTenant => this.setState({ currentTenant }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant } = this.state;

    if (currentTenant) {
      const { formatMessage } = this.props.intl;
      const image = currentTenant.data.attributes.logo.large || '';
      const title = i18n.getLocalized(currentTenant.data.attributes.settings.core.meta_title);
      const organizationName = i18n.getLocalized(currentTenant.data.attributes.settings.core.organization_name);
      const description = i18n.getLocalized(currentTenant.data.attributes.settings.core.meta_description);
      const url = `http://${currentTenant.data.attributes.host}`;

      return (
        <Helmet>
          <title>{formatMessage(messages.helmetTitle, { organizationName })}</title>
          <meta property="og:title" content={title} />
          <meta property="og:description" content={formatMessage(messages.helmetDescription, { organizationName })} />
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
