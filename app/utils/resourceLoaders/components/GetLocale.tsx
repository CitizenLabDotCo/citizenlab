import React from 'react';
import { Subscription } from 'rxjs';
import { Locale } from 'typings';
import { localeStream } from 'services/locale';

interface InputProps {}

interface Props extends InputProps {
  children: (renderProps: GetLocaleChildProps) => JSX.Element | null ;
}

interface State {
  locale: Locale;
}

export type GetLocaleChildProps = State;

export default class GetLocale extends React.PureComponent<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      locale: 'en',
    };
  }

  componentDidMount() {
    const locale$ = localeStream().observable;

    this.subscriptions = [
      locale$.subscribe((locale) => {
        this.setState({ locale });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { locale } = this.state;
    return children({ locale });
  }
}
