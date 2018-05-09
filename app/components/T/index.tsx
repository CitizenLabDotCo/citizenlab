import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { Multiloc, Locale } from 'typings';

// services
import { getLocalized } from 'utils/i18n';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { Map } from 'immutable';

// utils
import { truncate } from 'utils/textUtils';

type Props = {
  value: Multiloc | Map<string,string>;
  as?: string;
  truncate?: number;
};

type State = {
  locale: Locale | null;
  currentTenantLocales: Locale[] | null;
};

export default class T extends React.PureComponent<Props, State> {

  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenantLocales: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
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
      const localizedText = truncate(getLocalized(value, locale, currentTenantLocales), this.props.truncate);

      if (this.props.as) {
        return React.createElement(this.props.as, { dangerouslySetInnerHTML: { __html: localizedText } });
      }

      return (
        <span dangerouslySetInnerHTML={{ __html: localizedText }} />
      );
    }

    return null;
  }
}
