import React from 'react';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Multiloc, Locale } from 'typings';
import { getLocalized } from 'utils/i18n';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

type children = (localizedText: string) => JSX.Element | null;

type Props = {
  value: Multiloc;
  as?: string;
  className?: string;
  children?: children;
  maxLength?: number;
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
      const { value, as, children, maxLength, className } = this.props;
      const localizedText = getLocalized(value, locale, currentTenantLocales, maxLength);

      if (children) {
        return ((children as children)(localizedText));
      }

      if (as) {
        return React.createElement(as, { className, dangerouslySetInnerHTML: { __html: localizedText } });
      }

      return (
        <span className={className} dangerouslySetInnerHTML={{ __html: localizedText }} />
      );
    }

    return null;
  }
}
