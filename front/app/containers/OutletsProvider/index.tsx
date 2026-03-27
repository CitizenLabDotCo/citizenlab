import React, { createContext, ReactNode, useEffect, useState } from 'react';

import staticModuleConfiguration from 'modules';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import {
  loadModules,
  ParsedModuleConfiguration,
  ModuleConfiguration,
} from 'utils/moduleUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';

export const OutletsContext = createContext({});

interface Props {
  children: ReactNode;
}

const OutletsProvider = ({ children }: Props) => {
  const appConfigration = useAppConfiguration();
  const [dynamicModuleConfigurations, setDynamicModuleConfigurations] =
    useState<ParsedModuleConfiguration[]>([]);
  const pluginsActive = useFeatureFlag({ name: 'plugins' });

  useEffect(() => {
    if (!pluginsActive) return;
    window.__GO_VOCAL_PLUGINS__ = {
      React,
      register: (configuration: ModuleConfiguration) => {
        const parsedConfiguration = loadModules([{ configuration }]);
        setDynamicModuleConfigurations((prev) => [
          ...prev,
          parsedConfiguration,
        ]);
      },
    };
  }, [pluginsActive]);

  useEffect(() => {
    if (!pluginsActive) return;
    appConfigration?.data?.data.attributes.settings.plugins?.active_plugins.forEach(
      (plugin) => {
        const script = document.createElement('script');
        script.src = plugin.url;
        script.async = true;
        document.head.appendChild(script);
      }
    );
  }, [
    appConfigration?.data?.data.attributes.settings.plugins?.active_plugins,
    pluginsActive,
  ]);

  return (
    <OutletsContext.Provider
      value={{
        ...staticModuleConfiguration.outlets,
        ...dynamicModuleConfigurations.reduce(
          (acc, config) => ({ ...acc, ...config.outlets }),
          {}
        ),
      }}
    >
      {children}
    </OutletsContext.Provider>
  );
};

export default OutletsProvider;
