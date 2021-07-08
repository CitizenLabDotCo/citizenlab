import { useState, useEffect } from 'react';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';

export default function useSettingEnabled(settingName: string) {
  const [settingEnabled, setSettingEnabled] = useState<boolean | null>(null);
  const appConfiguration = useAppConfiguration();

  useEffect(() => {
    if (isNilOrError(appConfiguration)) return;
    const setting = appConfiguration.data.attributes.settings[settingName];
    const settingIsEnabled = setting && setting.allowed && setting.enabled;

    setSettingEnabled(!!settingIsEnabled);
  }, [settingName, appConfiguration]);

  return settingEnabled;
}
