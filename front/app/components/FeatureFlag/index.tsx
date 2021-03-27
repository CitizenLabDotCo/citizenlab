import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { Subscription } from 'rxjs';

// services
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  IAppConfigurationData,
} from 'services/appConfiguration';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  name: string;
  /** when this flag is set, the feature will show if it's allowed, regardless of whether it's enabled */
  onlyCheckAllowed: boolean;
}

interface State {
  currentTenant: IAppConfiguration | null;
}

export const isFeatureActive = (
  feature: string,
  tenant: IAppConfigurationData,
  options?: { onlyCheckAllowed?: boolean }
) => {
  return (
    get(tenant, `attributes.settings.${feature}.allowed`) === true &&
    (options?.onlyCheckAllowed ||
      get(tenant, `attributes.settings.${feature}.enabled`) === true)
  );
};

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
    const currentTenant$ = currentAppConfigurationStream().observable;
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

    if (isNilOrError(currentTenant)) return null;

    const showFeature =
      !name || isFeatureActive(name, currentTenant.data, { onlyCheckAllowed });

    if (this.props.children && showFeature) {
      return <React.Fragment>{this.props.children}</React.Fragment>;
    }

    return null;
  }
}
