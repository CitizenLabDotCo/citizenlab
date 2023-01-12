// Libraries
import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';

// Services
import { localeStream } from 'services/locale';
import { currentAppConfigurationStream } from 'services/appConfiguration';

// hooks
import { Localize } from 'hooks/useLocalize';

// i18n
import { getLocalizedWithFallback } from 'utils/i18n';

// Typing
import { Locale } from 'typings';
import { isNilOrError } from './helperUtils';

export interface InjectedLocalized {
  localize: Localize;
  locale: Locale;
  tenantLocales: Locale[];
}

export interface State {
  locale: Locale | null;
  tenantLocales: Locale[];
}

export default function injectLocalize<P>(
  Component: React.ComponentType<P & InjectedLocalized>
) {
  return class Localized extends PureComponent<P, State> {
    subscriptions: Subscription[];
    static displayName = `WithLocalize(${getDisplayName(Component)})`;

    constructor(props: P) {
      super(props);
      this.state = {
        locale: null,
        tenantLocales: [],
      };
      this.subscriptions = [];
    }

    componentDidMount() {
      const locale$ = localeStream().observable;
      const currentTenant$ = currentAppConfigurationStream().observable;

      this.subscriptions = [
        combineLatest([locale$, currentTenant$]).subscribe(
          ([locale, currentTenant]) => {
            if (!isNilOrError(locale) && !isNilOrError(currentTenant)) {
              const tenantLocales =
                currentTenant.data.attributes.settings.core.locales;
              this.setState({ locale, tenantLocales });
            }
          }
        ),
      ];
    }

    componentWillUnmount() {
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    localize: Localize = (multiloc, { maxChar, fallback } = {}) => {
      return getLocalizedWithFallback(
        multiloc,
        this.state.locale,
        this.state.tenantLocales,
        maxChar,
        fallback
      );
    };

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

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}
