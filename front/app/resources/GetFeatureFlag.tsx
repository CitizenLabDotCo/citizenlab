import { get } from 'lodash-es';

// services
import { TAppConfigurationSetting } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

type children = (renderProps: GetFeatureFlagChildProps) => JSX.Element | null;

interface Props {
  name: TAppConfigurationSetting;
  children?: children;
}

export type GetFeatureFlagChildProps = boolean;

const GetFeatureFlag = (props: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const appConfigurationSettings = appConfiguration?.data?.attributes?.settings;

  const { name, children } = props;
  const showFeature =
    !name ||
    (get(appConfigurationSettings, `${name}.allowed`) === true &&
      get(appConfigurationSettings, `${name}.enabled`) === true);
  return (children as children)(showFeature);
};

export default GetFeatureFlag;
