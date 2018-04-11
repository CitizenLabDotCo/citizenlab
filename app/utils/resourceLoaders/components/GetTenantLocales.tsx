import React from 'react';
import { Subscription } from 'rxjs';
import { currentTenantStream } from 'services/tenant';
import { Locale } from 'typings';

interface InputProps {}

type children = (renderProps: GetTenantLocalesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  tenantLocales: Locale[] | null;
}

export type GetTenantLocalesChildProps = Locale[] | null;

export default class GetTenantLocales extends React.PureComponent<Props, State> {
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      tenantLocales: null
    };
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({
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
    const { tenantLocales } = this.state;
    return (children as children)(tenantLocales);
  }
}
