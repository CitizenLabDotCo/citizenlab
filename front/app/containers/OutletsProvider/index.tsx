import React, { createContext, ReactNode, useEffect, useState } from 'react';

import staticModuleConfiguration from 'modules';
import usePluginFrontEntries from 'api/plugins/usePluginFrontEntries';
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
  const [dynamicModuleConfigurations, setDynamicModuleConfigurations] =
    useState<ParsedModuleConfiguration[]>([]);
  const pluginsActive = useFeatureFlag({ name: 'plugins' });
  const { data: pluginFrontEntries } = usePluginFrontEntries(pluginsActive);

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
    if (!pluginFrontEntries) return;
    pluginFrontEntries.data.forEach((entry) => {
      const script = document.createElement('script');
      script.src = entry.attributes.url;
      script.async = true;
      document.head.appendChild(script);
    });
  }, [pluginFrontEntries]);

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
