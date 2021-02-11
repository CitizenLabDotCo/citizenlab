import React from 'react';
import { Subscription } from 'rxjs';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (renderProps: GetTenantLocalesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  tenantLocales: Locale[] | undefined | null | Error;
}

export type GetTenantLocalesChildProps = Locale[] | undefined | null | Error;

export default class GetTenantLocales extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      tenantLocales: undefined,
    };
  }

  componentDidMount() {
    const currentTenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({
          tenantLocales: !isNilOrError(currentTenant)
            ? currentTenant.data.attributes.settings.core.locales
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
    const { tenantLocales } = this.state;
    return (children as children)(tenantLocales);
  }
}
