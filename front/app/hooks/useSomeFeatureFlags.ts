import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  TAppConfigurationSetting,
} from 'services/appConfiguration';
import { get } from 'lodash-es';

type Parameters = {
  names: TAppConfigurationSetting[];
  onlyCheckAllowed?: boolean;
};

// copied and modified from front/app/hooks/useFeatureFlag.ts
export default function useSomeFeatureFlags({
  names,
  onlyCheckAllowed,
}: Parameters) {
  const [tenantSettings, setTenantSettings] = useState<
    | IAppConfiguration['data']['attributes']['settings']
    | undefined
    | null
    | Error
  >(undefined);

  useEffect(() => {
    const subscription = currentAppConfigurationStream().observable.subscribe(
      (tenantSettings) =>
        setTenantSettings(tenantSettings.data.attributes.settings)
    );

    return subscription.unsubscribe();
  }, []);

  return names.some(
    (name) =>
      get(tenantSettings, `${name}.allowed`) === true &&
      (onlyCheckAllowed || get(tenantSettings, `${name}.enabled`) === true)
  );
}
