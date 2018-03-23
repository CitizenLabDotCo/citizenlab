// Libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { Locale } from 'typings';
import { localeStream } from 'services/locale';

// Typings
export interface Props {
  children: {(state: Partial<State>): any};
}
export interface State {
  locale: Locale;
}

class GetLocale extends React.PureComponent<Props, State> {
  private sub: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      locale: 'en',
    };
  }

  componentDidMount() {
    this.sub = localeStream().observable.subscribe((locale) => {
      this.setState({ locale });
    });
  }

  componentWillUnmount() {
    this.sub.unsubscribe();
  }

  render() {
    return this.props.children(this.state);
  }
}

export default GetLocale;
