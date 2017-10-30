// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// i18n
import { getLocalized } from 'utils/i18n';

// Typing
import { Multiloc } from 'typings';

export interface injectedLocalized {
  localize: {
    (multiloc: Multiloc): string;
  };
}

interface Props {}

interface State {
  locale: string;
  tenantLocales: string[];
}

function localize<PassedProps>(ComposedComponent) {
  return class Localized extends React.Component<Props & PassedProps, State>{
    subscriptions: Rx.Subscription[];

    constructor() {
      super();

      this.state = {
        locale: '',
        tenantLocales: [],
      };

      this.subscriptions = [];
    }

    componentDidMount() {
      this.subscriptions.push(this.updateLocales());
    }

    componentWillUnmount() {
      this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
    }

    updateLocales = () => {
      return Rx.Observable.combineLatest(
        localeStream().observable,
        currentTenantStream().observable
      )
      .subscribe(([locale, currentTenant]) => {
        this.setState({
          locale,
          tenantLocales: currentTenant.data.attributes.settings.core.locales,
        });
      });
    }

    localize = (multiloc: Multiloc): string => {
      return getLocalized(multiloc, this.state.locale, this.state.tenantLocales);
    }

    render() {
      return <ComposedComponent localize={this.localize} {...this.props} />;
    }
  };
}

export default localize;
