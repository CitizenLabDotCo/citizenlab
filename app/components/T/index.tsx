import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// services
import { getLocalized } from 'utils/i18n';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';

type Props = {
  value: { [key: string]: string }
};

type State = {
  locale: string | null;
  currentTenantLocales: string[] | null;
};

export default class T extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      currentTenantLocales: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$
      ).subscribe(([locale, currentTenantLocales]) => {
        this.setState({ locale, currentTenantLocales });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { locale, currentTenantLocales } = this.state;

    if (locale && currentTenantLocales) {
      const { value } = this.props;
      const localizedText = getLocalized(value, locale, currentTenantLocales);

      return (
        <span dangerouslySetInnerHTML={{ __html: localizedText }} />
      );
    }

    return null;
  }
}
