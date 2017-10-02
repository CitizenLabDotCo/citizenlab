import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// services
import i18n from 'utils/i18n';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';

type Props = {
  value: { [key: string]: string }
};

type State = {
  locale: string | null;
  currentTenantLocales: string[] | null;
  loading: boolean;
  date: number | null;
};

export default class T extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      currentTenantLocales: null,
      loading: true,
      date: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => (currentTenant ? currentTenant.data.attributes.settings.core.locales : null));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$
      ).subscribe(([locale, currentTenantLocales]) => {
        this.setState({ locale, currentTenantLocales, loading: false, date: Date.now() });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { loading } = this.state;

    if (!loading) {
      const { value } = this.props;
      const localizedText = i18n.getLocalized(value);

      return (
        <span dangerouslySetInnerHTML={{ __html: localizedText }} />
      );
    }

    return null;
  }
}
