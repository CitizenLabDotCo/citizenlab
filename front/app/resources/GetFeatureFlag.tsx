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
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const appConfigurationSettings = appConfiguration?.data?.attributes?.settings;

  const { name, children } = props;
  const showFeature =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !name ||
    (get(appConfigurationSettings, `${name}.allowed`) === true &&
      get(appConfigurationSettings, `${name}.enabled`) === true);
  return (children as children)(showFeature);
};

export default GetFeatureFlag;
