import React from 'react';
import { Subscription } from 'rxjs';
import { IntlProvider } from 'react-intl';
import { localeStream } from 'services/locale';
import { Locale } from 'typings';

type Props = {
  getMessages: Function;
  // messages: { [key: string]: any };
};

type State = {
  locale: Locale | null;
};

export default class LanguageProvider extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      locale: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;

    this.subscriptions = [
      locale$.subscribe(locale => this.setState({ locale })),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { locale } = this.state;

    if (locale) {
      const { getMessages } = this.props;
      const messages = getMessages(locale);

      return (
        <IntlProvider locale={locale} key={locale} messages={messages}>
          {React.Children.only(this.props.children)}
        </IntlProvider>
      );
    }

    return null;
  }
}
