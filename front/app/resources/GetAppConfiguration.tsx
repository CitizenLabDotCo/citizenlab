import React from 'react';
import { Subscription } from 'rxjs';
import {
  currentAppConfigurationStream,
  IAppConfigurationData,
} from 'services/appConfiguration';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (
  renderProps: GetAppConfigurationChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  tenant: IAppConfigurationData | undefined | null | Error;
}

export type GetAppConfigurationChildProps =
  | IAppConfigurationData
  | undefined
  | null
  | Error;

export default class GetAppConfiguration extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      tenant: undefined,
    };
  }

  componentDidMount() {
    const currentTenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({
          tenant: !isNilOrError(currentTenant)
            ? currentTenant.data
            : currentTenant,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { tenant } = this.state;
    return (children as children)(tenant);
  }
}
