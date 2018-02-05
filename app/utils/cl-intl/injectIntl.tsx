import * as React from 'react';
import * as Rx from 'rxjs';
// import { cloneDeep } from 'lodash';
import { currentTenantStream } from 'services/tenant';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { injectIntl as originalInjectIntl, ComponentConstructor, InjectedIntlProps, InjectIntlConfig } from 'react-intl';
import { localeStream } from 'services/locale';
import { getLocalized } from 'utils/i18n';

type State = {
  orgName: string | null;
  orgType: string | null;
  loaded: boolean;
};

function buildComponent<P>(Component: ComponentConstructor<P & InjectedIntlProps>) {
  return class NewFormatMessageComponent extends React.PureComponent<P & InjectedIntlProps, State> {
    subscriptions: Rx.Subscription[];

    constructor(props: P) {
      super(props as any);
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
        Rx.Observable.combineLatest(
          locale$,
          currentTenant$,
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

    formatMessageReplacement = (messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor, values?: {
      [key: string]: string | number | boolean | Date;
    } | undefined): string => {
      return this.props.intl.formatMessage(messageDescriptor, { orgName: this.state.orgName, orgType: this.state.orgType, ...values || {} });
    }

    render() {
      const { loaded } = this.state;

      if (loaded) {
        const { intl } = this.props;
        // const intlReplacement = cloneDeep(intl);
        // intlReplacement.formatMessage = this.formatMessageReplacement;

        const intlReplacement = {
          ...(intl as object),
          formatMessage: this.formatMessageReplacement
        };

        console.log(this.props);
        console.log(intlReplacement);

        return <Component {...this.props} intl={intlReplacement} />;
      }

      return null;
    }
  };
}

export default function injectIntl<P>(component: ComponentConstructor<P & InjectedIntlProps>, options?: InjectIntlConfig):
  React.ComponentClass<P> & { WrappedComponent: ComponentConstructor<P & InjectedIntlProps> } {
  return originalInjectIntl(buildComponent<P>(component), options);
}
