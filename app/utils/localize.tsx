// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// i18n
import { getLocalized } from 'utils/i18n';

// Typing
import { Multiloc, Locale } from 'typings';

export interface injectedLocalized {
  localize: {
    (multiloc: Multiloc): string;
  };
  locale: Locale;
  tenantLocales: Locale[];
}

interface Props {}

interface State {
  locale: Locale;
  tenantLocales: Locale[];
}

export default function localize<PassedProps>(ComposedComponent) {
  return class Localized extends React.PureComponent<Props & PassedProps, State>{
    subscriptions: Rx.Subscription[];

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
        Rx.Observable.combineLatest(
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
          <ComposedComponent
            localize={this.localize}
            locale={this.state.locale}
            tenantLocales={this.state.tenantLocales}
            {...this.props}
          />
        );
      }

      return null;
    }
  };
}
