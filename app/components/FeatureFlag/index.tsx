import * as React from 'react';
import { get } from 'lodash';
import * as Rx from 'rxjs';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

interface Props {
  name?: string;
}

interface State {
  currentTenant: ITenant | null;
}

export default class FeatureFlag extends React.PureComponent<Props, State> {
  subscription: Rx.Subscription | null;

  constructor(props: Props) {
    super(props as any);
    this.state = { currentTenant: null };
    this.subscription = null;
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;
    this.subscription = currentTenant$.subscribe(currentTenant => this.setState({ currentTenant }));
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  render() {
    const { currentTenant } = this.state;
    const { name } = this.props;
    const showFeature = (!name || (
      get(currentTenant, `data.attributes.settings.${name}.allowed`) === true &&
      get(currentTenant, `data.attributes.settings.${name}.enabled`) === true
    ));

    if (this.props.children && showFeature) {
      return (
        <React.Fragment>
          {this.props.children}
        </React.Fragment>
      );
    }

    return null;
  }
}
