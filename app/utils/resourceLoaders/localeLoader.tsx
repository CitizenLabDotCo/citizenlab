import React from 'react';
import { Subscription } from 'rxjs';

import { localeStream } from 'services/locale';
import { Locale } from 'typings';

export interface InjectedLocale {
  locale: Locale;
}

interface State {
  locale: Locale;
}

export const injectLocale = () => {
  return <TOriginalProps extends {}>(
    Component: (React.ComponentClass<TOriginalProps & InjectedLocale> | React.StatelessComponent<TOriginalProps & InjectedLocale>)
  ) => {
    type ResultProps = TOriginalProps;

    const result = class LocaleLoader extends React.Component<ResultProps, State> {
      static displayName = `LocaleLoader(${Component.displayName || Component.name})`;
      sub: Subscription;

      constructor(props: ResultProps) {
        super(props);
        this.state = {
          locale: 'en',
        };
      }

      componentDidMount() {
        this.sub = localeStream()
        .observable
        .subscribe((response) => {
          this.setState({ locale: response });
        });
      }

      componentWillUnmount() {
        this.sub.unsubscribe();
      }

      render(): JSX.Element {
        return (
          <Component {...this.state} {...this.props} />
        );
      }
    };

    return result;
  };
};
