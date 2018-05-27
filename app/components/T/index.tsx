import React from 'react';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Multiloc, Locale } from 'typings';
import { getLocalized } from 'utils/i18n';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

type Props = {
  value: Multiloc;
  as?: string;
};

type State = {
  locale: Locale | null;
  currentTenantLocales: Locale[] | null;
};

export default class T extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
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
      combineLatest(
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
