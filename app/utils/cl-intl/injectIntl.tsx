import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { currentTenantStream } from 'services/tenant';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { injectIntl as originalInjectIntl, InjectedIntlProps, InjectIntlConfig } from 'react-intl';
import { localeStream } from 'services/locale';
import { getLocalized } from 'utils/i18n';

type State = {
  orgName: string | null;
  orgType: string | null;
  loaded: boolean;
};

function buildComponent<P>(Component: React.ComponentType<P & InjectedIntlProps>) {
  return class NewFormatMessageComponent extends PureComponent<P & InjectedIntlProps, State> {
    subscriptions: Subscription[];

    constructor(props) {
      super(props);
      this.state = {
        orgName: null,
        orgType: null,
        loaded: false
      };
      this.subscriptions = [];
    }

    componentDidMount() {
      const locale$ = localeStream().observable;
      const currentTenant$ = currentTenantStream().observable;

      this.subscriptions = [
        combineLatest(
          locale$,
          currentTenant$
        ).subscribe(([locale, tenant]) => {
          const tenantLocales = tenant.data.attributes.settings.core.locales;
          const orgName = getLocalized(tenant.data.attributes.settings.core.organization_name, locale, tenantLocales);
          const orgType = tenant.data.attributes.settings.core.organization_type;
          this.setState({ orgName, orgType, loaded: true });
        })
      ];
    }

    componentWillUnmount() {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    formatMessageReplacement = (messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor, values?: { [key: string]: string | number | boolean | Date } | undefined) => {
      return this.props.intl.formatMessage(messageDescriptor, { orgName: this.state.orgName, orgType: this.state.orgType, ...values || {} });
    }

    render() {
      const { loaded } = this.state;

      if (loaded) {
        const { intl } = this.props;
        const intlReplacement = {
          ...(intl as object),
          formatMessage: this.formatMessageReplacement
        };

        return <Component {...this.props} intl={intlReplacement} />;
      }

      return null;
    }
  };
}

export default function injectIntl<P>(component: React.ComponentType<P & InjectedIntlProps>, options?: InjectIntlConfig) {
  return originalInjectIntl<P & InjectedIntlProps>(buildComponent<P & InjectedIntlProps>(component), options);
}
