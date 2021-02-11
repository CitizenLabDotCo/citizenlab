import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { currentAppConfigurationStream } from 'services/tenant';
// tslint:disable-next-line:no-vanilla-formatted-messages
import {
  injectIntl as originalInjectIntl,
  InjectedIntlProps,
  InjectIntlConfig,
} from 'react-intl';
import { localeStream } from 'services/locale';
import { getLocalized } from 'utils/i18n';
import { getDisplayName, isNilOrError } from 'utils/helperUtils';

type State = {
  tenantName: string | null;
  orgName: string | null;
  orgType: string | null;
  loaded: boolean;
};

function buildComponent<P>(
  Component: React.ComponentType<P & InjectedIntlProps>
) {
  return class NewFormatMessageComponent extends PureComponent<
    P & InjectedIntlProps,
    State
  > {
    subscriptions: Subscription[];
    static displayName = `WithIntl(${getDisplayName(Component)})`;

    constructor(props) {
      super(props);
      this.state = {
        tenantName: null,
        orgName: null,
        orgType: null,
        loaded: false,
      };
      this.subscriptions = [];
    }

    componentDidMount() {
      const locale$ = localeStream().observable;
      const currentTenant$ = currentAppConfigurationStream().observable;

      this.subscriptions = [
        combineLatest(locale$, currentTenant$).subscribe(([locale, tenant]) => {
          if (!isNilOrError(locale) && !isNilOrError(tenant)) {
            const tenantLocales = tenant.data.attributes.settings.core.locales;
            const tenantName = tenant.data.attributes.name;
            const orgName = getLocalized(
              tenant.data.attributes.settings.core.organization_name,
              locale,
              tenantLocales
            );
            const orgType =
              tenant.data.attributes.settings.core.organization_type;
            this.setState({ tenantName, orgName, orgType, loaded: true });
          }
        }),
      ];
    }

    componentWillUnmount() {
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    formatMessageReplacement = (
      messageDescriptor: ReactIntl.FormattedMessage.MessageDescriptor,
      values?: { [key: string]: string | number | boolean | Date } | undefined
    ) => {
      return this.props.intl.formatMessage(messageDescriptor, {
        tenantName: this.state.tenantName,
        orgName: this.state.orgName,
        orgType: this.state.orgType,
        ...(values || {}),
      });
    };

    render() {
      const { loaded } = this.state;

      if (loaded) {
        const { intl } = this.props;
        const intlReplacement = {
          ...(intl as object),
          formatMessage: this.formatMessageReplacement,
        };

        return <Component {...this.props} intl={intlReplacement} />;
      }

      return null;
    }
  };
}

export default function injectIntl<P>(
  component: React.ComponentType<P & InjectedIntlProps>,
  options?: InjectIntlConfig
) {
  return originalInjectIntl<P & InjectedIntlProps>(
    buildComponent<P & InjectedIntlProps>(component),
    options
  );
}
