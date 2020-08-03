import { useState, useEffect } from 'react';
import { currentTenantStream, ITenant } from 'services/tenant';

export default function useTenant() {
  const [tenant, setTenant] = useState<ITenant | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    const subscription = currentTenantStream().observable.subscribe(
      (currentTenant) => {
        setTenant(currentTenant);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return tenant;
}
