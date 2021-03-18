import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  AppConfigurationSettingsFeatureNames,
} from 'services/appConfiguration';
import { get } from 'lodash-es';

export default function useFeatureFlag(
  name: AppConfigurationSettingsFeatureNames
) {
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
  });

  return (
    get(tenantSettings, `${name}.allowed`) === true &&
    get(tenantSettings, `${name}.enabled`) === true
  );
}
