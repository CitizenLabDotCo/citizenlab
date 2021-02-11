import { useState, useEffect } from 'react';
import {
  currentTenantStream,
  IAppConfiguration,
  AppConfigurationSettingsFeatureNames,
} from 'services/tenant';
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
    const subscription = currentTenantStream().observable.subscribe(
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
