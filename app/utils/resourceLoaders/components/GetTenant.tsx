import React from 'react';
import { Subscription } from 'rxjs';
import { currentTenantStream, ITenantData } from 'services/tenant';

interface InputProps {}

type children = (renderProps: GetTenantChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  tenant: ITenantData | null;
}

export type GetTenantChildProps = ITenantData | null;

export default class GetTenant extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      tenant: null
    };
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe((currentTenant) => {
        this.setState({
          tenant: currentTenant.data
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { tenant } = this.state;
    return (children as children)(tenant);
  }
}
