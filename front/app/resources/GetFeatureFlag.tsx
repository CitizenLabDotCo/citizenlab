import { get } from 'lodash-es';

import { TAppConfigurationSetting } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

type children = (renderProps: boolean) => JSX.Element | null;

interface Props {
  name: TAppConfigurationSetting;
  children?: children;
}

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
