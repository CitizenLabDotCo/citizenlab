import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

import { IntlProvider } from 'react-intl';

// services
import { localeStream } from 'services/locale';

import { Locale, Message } from 'typings';

type Props = {
  messages: { [key: string]: any };
};

type State = {
  locale: Locale | null;
};

export default class LanguageProvider extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;

    this.subscriptions = [
      locale$.subscribe(locale => this.setState({ locale })),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { messages } = this.props;
    const { locale } = this.state;

    return (locale ? (
      <IntlProvider locale={locale} key={locale} messages={messages[locale]}>
        {React.Children.only(this.props.children)}
      </IntlProvider>
    ) : null);
  }
}
