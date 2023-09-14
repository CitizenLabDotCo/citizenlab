import { useEffect, useState } from 'react';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

export default function useCopenhagenPlatformCheck() {
  const { data: appConfiguration } = useAppConfiguration();
  const [isCopenhagenPlatform, setIsCopenhagenPlatform] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    if (appConfiguration) {
      const isCopenhagenPlatform =
        appConfiguration.data.id === '743d892a-9489-4765-a546-ecf0943d262d';
      setIsCopenhagenPlatform(isCopenhagenPlatform);
    }
  }, [appConfiguration]);

  return isCopenhagenPlatform;
}
