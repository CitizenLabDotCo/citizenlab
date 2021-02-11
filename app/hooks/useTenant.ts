import { useState, useEffect } from 'react';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
} from 'services/tenant';

export default function useTenant() {
  const [tenant, setTenant] = useState<
    IAppConfiguration | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = currentAppConfigurationStream().observable.subscribe(
      (currentTenant) => {
        setTenant(currentTenant);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return tenant;
}
