import { useState, useEffect } from 'react';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

export default function useTenantLocales() {
  const [tenantLocales, setTenantLocales] = useState<
    Locale[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = currentAppConfigurationStream().observable.subscribe(
      (currentTenant) => {
        setTenantLocales(
          !isNilOrError(currentTenant)
            ? currentTenant.data.attributes.settings.core.locales
            : currentTenant
        );
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return tenantLocales;
}
