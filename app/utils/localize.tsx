// Libraries
import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';

// Services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// i18n
import { getLocalized } from 'utils/i18n';

// Typing
import { Multiloc, Locale } from 'typings';

export interface InjectedLocalized {
  localize: {
    (multiloc: Multiloc): string;
  };
  locale: Locale;
  tenantLocales: Locale[];
}

export interface State {
  locale: Locale;
  tenantLocales: Locale[];
}

export default function localize<P>(Component: React.ComponentType<P & InjectedLocalized>) {
  return class Localized extends PureComponent<P, State> {
    subscriptions: Subscription[];

    constructor(props) {
      super(props);
      this.state = {
        locale: 'en',
        tenantLocales: [],
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
        ).subscribe(([locale, currentTenant]) => {
          const tenantLocales = currentTenant.data.attributes.settings.core.locales;
          this.setState({ locale, tenantLocales });
        })
      ];
    }

    componentWillUnmount() {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    localize = (multiloc: Multiloc): string => {
      return getLocalized(multiloc, this.state.locale, this.state.tenantLocales);
    }

    render() {
      const { locale, tenantLocales } = this.state;

      if (locale && tenantLocales) {
        return (
          <Component
            localize={this.localize}
            locale={locale}
            tenantLocales={tenantLocales}
            {...this.props}
          />
        );
      }

      return null;
    }
  };
}
