import React from 'react';
import { Subscription } from 'rxjs';
import { Locale } from 'typings';
import { currentTenantStream, ITenantData } from 'services/tenant';

interface Props {
  children: (renderProps: GetTenantChildProps) => JSX.Element | null ;
}

interface State {
  tenant: ITenantData | null;
  tenantLocales: Locale[] | null;
}

export type GetTenantChildProps = State;

export default class GetTenant extends React.PureComponent<Props, State> {
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      tenant: null,
      tenantLocales: null,
    };
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({
          tenant: currentTenant.data,
          tenantLocales: currentTenant.data.attributes.settings.core.locales
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { tenant, tenantLocales } = this.state;
    return children({ tenant, tenantLocales });
  }
}
