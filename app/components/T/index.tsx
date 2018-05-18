import React from 'react';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Multiloc, Locale } from 'typings';
import { getLocalized } from 'utils/i18n';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// utils
import { truncate } from 'utils/textUtils';

type Props = {
  value: Multiloc;
  as?: string;
  truncate?: number;
  className?: string;
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
      const localizedText = truncate(getLocalized(value, locale, currentTenantLocales), this.props.truncate);

      if (this.props.as) {
        return React.createElement(this.props.as, { className: this.props.className, dangerouslySetInnerHTML: { __html: localizedText } });
      }

      return (
        <span className={this.props.className} dangerouslySetInnerHTML={{ __html: localizedText }} />
      );
    }

    return null;
  }
}
