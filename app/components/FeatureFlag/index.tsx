// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';

// Services
import { currentTenantStream, ITenantData } from 'services/tenant';


interface Props {
  name: string;
}

interface State {
  tenant: ITenantData | null;
}

export default class FeatureFlag extends React.Component<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor () {
    super();

    this.state = {
      tenant: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    this.subscriptions.push(
      currentTenantStream().observable
      .subscribe((tenantResponse) => {
        this.setState({ tenant: tenantResponse.data });
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  isAllowed = () => {
    const { tenant } = this.state;
    const { name } = this.props;
    return tenant && tenant.attributes.settings[name] && tenant.attributes.settings[name].allowed && tenant.attributes.settings[name].enabled;
  }

  render() {
    return (
      <div>
        {this.isAllowed() && this.props.children}
      </div>
    );
  }
}
