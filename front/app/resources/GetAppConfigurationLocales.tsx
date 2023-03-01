import React from 'react';
import { Subscription } from 'rxjs';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (
  renderProps: GetAppConfigurationLocalesChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  appConfigurationLocales: Locale[] | undefined | null | Error;
}

export type GetAppConfigurationLocalesChildProps =
  | Locale[]
  | undefined
  | null
  | Error;

export default class GetAppConfigurationLocales extends React.Component<
  Props,
  State
> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      appConfigurationLocales: undefined,
    };
  }

  componentDidMount() {
    const currentAppConfiguration$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      currentAppConfiguration$.subscribe((currentAppConfiguration) => {
        this.setState({
          appConfigurationLocales: !isNilOrError(currentAppConfiguration)
            ? currentAppConfiguration.data.attributes.settings.core.locales
            : currentAppConfiguration,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { appConfigurationLocales } = this.state;
    return (children as children)(appConfigurationLocales);
  }
}
