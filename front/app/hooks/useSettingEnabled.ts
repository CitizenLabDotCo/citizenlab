import { useState, useEffect } from 'react';
import { currentAppConfigurationStream } from 'services/appConfiguration';

export default function useSettingEnabled(settingName: string) {
  const [settingEnabled, setSettingEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const observable = currentAppConfigurationStream().observable;

    const subscription = observable.subscribe((configuration) => {
      const setting = configuration.data.attributes.settings[settingName];
      setSettingEnabled(!!(setting && setting.allowed && setting.enabled));
    });

    return () => subscription.unsubscribe();
  }, [settingName]);

  return settingEnabled;
}
