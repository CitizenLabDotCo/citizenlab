import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { Subscription } from 'rxjs';

// services
import { currentTenantStream, ITenant } from 'services/tenant';

interface Props {
  name: string;
  /** when this flag is set, the feature will show if it's allowed, regardless of whether it's enabled */
  onlyCheckAllowed: boolean;
}

interface State {
  currentTenant: ITenant | null;
}

export default class FeatureFlag extends PureComponent<Props, State> {
  public static defaultProps = {
    onlyCheckAllowed: false,
  };
  subscription: Subscription | null;

  constructor(props: Props) {
    super(props);
    this.state = { currentTenant: null };
    this.subscription = null;
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;
    this.subscription = currentTenant$.subscribe((currentTenant) =>
      this.setState({ currentTenant })
    );
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  render() {
    const { currentTenant } = this.state;
    const { name, onlyCheckAllowed } = this.props;
    const showFeature =
      !name ||
      (get(currentTenant, `data.attributes.settings.${name}.allowed`) ===
        true &&
        (onlyCheckAllowed ||
          get(currentTenant, `data.attributes.settings.${name}.enabled`) ===
            true));

    if (this.props.children && showFeature) {
      return <React.Fragment>{this.props.children}</React.Fragment>;
    }

    return null;
  }
}
