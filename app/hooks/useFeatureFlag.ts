import { useState, useEffect } from 'react';
import { currentTenantStream, ITenant } from 'services/tenant';
import { get } from 'lodash-es';

export default function useFeatureFlag(name: string) {
  const [tenantSettings, setTenantSettings] = useState<
    ITenant['data']['attributes']['settings'] | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = currentTenantStream().observable
      .subscribe(tenantSettings => setTenantSettings(
        tenantSettings.data.attributes.settings
      ));

    return subscription.unsubscribe();
  });

  return (
    get(tenantSettings, `${name}.allowed`) === true &&
    get(tenantSettings, `${name}.enabled`) === true
  );
}
