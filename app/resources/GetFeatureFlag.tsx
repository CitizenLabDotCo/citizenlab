import { PureComponent } from 'react';
import { get } from 'lodash-es';
import { Subscription } from 'rxjs';

// services
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  AppConfigurationSettingsFeatureNames,
} from 'services/appConfiguration';

type children = (renderProps: GetFeatureFlagChildProps) => JSX.Element | null;

interface Props {
  name?: AppConfigurationSettingsFeatureNames;
  children?: children;
}

interface State {
  tenantSettings: IAppConfiguration['data']['attributes']['settings'] | null;
}

export type GetFeatureFlagChildProps = boolean;

export default class GetFeatureFlag extends PureComponent<Props, State> {
  subscription: Subscription | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      tenantSettings: null,
    };
    this.subscription = null;
  }

  componentDidMount() {
    const currentTenant$ = currentAppConfigurationStream().observable;

    this.subscription = currentTenant$.subscribe((currentTenant) => {
      this.setState({ tenantSettings: currentTenant.data.attributes.settings });
    });
  }

  componentWillUnmount() {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  render() {
    const { tenantSettings } = this.state;
    const { name, children } = this.props;
    const showFeature =
      !name ||
      (get(tenantSettings, `${name}.allowed`) === true &&
        get(tenantSettings, `${name}.enabled`) === true);
    return (children as children)(showFeature);
  }
}
