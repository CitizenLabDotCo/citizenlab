import React from 'react';
import { Subscription } from 'rxjs';
import { Locale } from 'typings';
import { localeStream } from 'services/locale';

interface InputProps {}

type children = (renderProps: GetLocaleChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  locale: Locale;
}

export type GetLocaleChildProps = Locale;

export default class GetLocale extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      locale: 'en'
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
    return (children as children)(locale);
  }
}
