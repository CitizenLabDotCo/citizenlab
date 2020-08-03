import { useState, useEffect } from 'react';
import { currentTenantStream } from 'services/tenant';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

export default function useTenantLocales() {
  const [tenantLocales, setTenantLocales] = useState<
    Locale[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = currentTenantStream().observable.subscribe(
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
