import { PureComponent } from 'react';
import { get } from 'lodash-es';
import { Subscription } from 'rxjs';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

interface Props {
  name?: string;
  children: (showFeature: boolean) => JSX.Element;
}

interface State {
  tenantSettings: ITenant['data']['attributes']['settings'] | null;
}

export default class GetFeatureFlag extends PureComponent<Props, State> {
  subscription: Subscription | null;

  constructor(props: Props) {
    super(props);
    this.state = { tenantSettings: null };
    this.subscription = null;
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;
    this.subscription = currentTenant$.subscribe(currentTenant => {
      this.setState({ tenantSettings: currentTenant.data.attributes.settings });
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  render() {
    const { tenantSettings } = this.state;
    const { name, children } = this.props;
    const showFeature = (!name || (
      get(tenantSettings, `${name}.allowed`) === true &&
      get(tenantSettings, `${name}.enabled`) === true
    ));

    return children(showFeature);
  }
}
