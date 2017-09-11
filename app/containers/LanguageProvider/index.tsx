import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { IntlProvider } from 'react-intl';

// services
import { state, IStateStream } from 'services/state';
import { localeStream } from 'services/locale';

type Props = {
  messages: { [key: string]: any };
};

type State = {
  locale: string | null;
};

export const namespace = 'LanguageProvider/index';

export default class LanguageProvider extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    const initialState: State = { locale: null };
    this.state$ = state.createStream<State>(namespace, namespace, initialState);
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),
      localeStream().observable.subscribe(locale => this.state$.next({ locale })),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { messages } = this.props;
    const { locale } = this.state;

    return (locale ? (
      <IntlProvider locale={locale} messages={messages[locale]}>
        {React.Children.only(this.props.children)}
      </IntlProvider>
    ) : null);
  }
}
