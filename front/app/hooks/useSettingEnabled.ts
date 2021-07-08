import { useState, useEffect } from 'react';
import { currentAppConfigurationStream } from 'services/appConfiguration';

export default function useSettingEnabled(settingName: string) {
  const [settingEnabled, setSettingEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const observable = currentAppConfigurationStream().observable;

    const subscription = observable.subscribe((configuration) => {
      const setting = configuration.data.attributes.settings[settingName];
      const settingIsEnabled = setting && setting.allowed && setting.enabled;

      setSettingEnabled(!!settingIsEnabled);
    });

    return () => subscription.unsubscribe();
  }, [settingName]);

  return settingEnabled;
}
