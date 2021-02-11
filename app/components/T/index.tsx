import React, { createElement } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Multiloc, Locale } from 'typings';
import { getLocalized } from 'utils/i18n';
import { localeStream } from 'services/locale';
import { currentAppConfigurationStream } from 'services/tenant';

type children = (localizedText: string) => JSX.Element | null;

type Props = {
  value: Multiloc | null | undefined;
  as?: string;
  className?: string;
  children?: children;
  maxLength?: number;
  supportHtml?: boolean;
  graphql?: boolean;
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
      currentTenantLocales: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentAppConfigurationStream().observable.pipe(
      map(
        (currentTenant) => currentTenant.data.attributes.settings.core.locales
      )
    );

    this.subscriptions = [
      combineLatest(locale$, currentTenantLocales$).subscribe(
        ([locale, currentTenantLocales]) => {
          this.setState({ locale, currentTenantLocales });
        }
      ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { locale, currentTenantLocales } = this.state;

    if (locale && currentTenantLocales) {
      const {
        value,
        as,
        children,
        maxLength,
        className,
        supportHtml,
      } = this.props;
      const localizedText = getLocalized(
        value,
        locale,
        currentTenantLocales,
        maxLength
      );

      if (children) {
        return (children as children)(localizedText);
      }

      if (supportHtml) {
        return createElement(as || 'span', {
          className,
          dangerouslySetInnerHTML: { __html: localizedText },
        });
      } else {
        return createElement(as || 'span', {
          className,
          children: localizedText,
        });
      }
    }

    return null;
  }
}
