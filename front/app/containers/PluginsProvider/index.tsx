import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { castArray, mergeWith } from 'lodash-es';
import { useParams } from 'react-router-dom';

import usePluginFrontEntries from 'api/plugins/usePluginFrontEntries';
import staticModuleConfiguration from 'modules';

import Link from 'utils/cl-router/Link';

import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  loadModules,
  ModuleConfiguration,
  ParsedModuleConfiguration,
} from 'utils/moduleUtils';

interface PluginsContextValue {
  merged: ParsedModuleConfiguration;
  ready: boolean;
}

const EMPTY_CONFIG: ParsedModuleConfiguration = {
  outlets: {},
  routes: {
    citizen: [],
    admin: [],
    'admin.ideas': [],
    'admin.pages-menu': [],
    'admin.dashboards': [],
    'admin.projects': [],
    'admin.projects.byId': [],
    'admin.project_templates': [],
    'admin.settings': [],
    'admin.tools': [],
    'admin.reporting': [],
  },
  beforeMountApplication: () => undefined,
  afterMountApplication: () => undefined,
  streamsToReset: [],
};

export const PluginsContext = createContext<PluginsContextValue>({
  merged: EMPTY_CONFIG,
  ready: true,
});

const mergeParsedConfigs = (
  ...configs: ParsedModuleConfiguration[]
): ParsedModuleConfiguration => {
  const concatArrays = (a: unknown = [], b: unknown = []) =>
    castArray(a).concat(castArray(b));

  return {
    outlets: mergeWith({}, ...configs.map((c) => c.outlets), concatArrays),
    routes: mergeWith({}, ...configs.map((c) => c.routes), concatArrays),
    beforeMountApplication: () =>
      configs.forEach((c) => c.beforeMountApplication?.()),
    afterMountApplication: () =>
      configs.forEach((c) => c.afterMountApplication?.()),
    streamsToReset: configs.flatMap((c) => c.streamsToReset ?? []),
  };
};

interface Props {
  children: ReactNode;
}

const PluginsProvider = ({ children }: Props) => {
  const [dynamicConfigs, setDynamicConfigs] = useState<
    ParsedModuleConfiguration[]
  >([]);
  const [loadedScriptCount, setLoadedScriptCount] = useState(0);
  const pluginsActive = useFeatureFlag({ name: 'plugins' });
  const { data: pluginFrontEntries } = usePluginFrontEntries(pluginsActive);

  useEffect(() => {
    if (!pluginsActive) return;
    window.__GO_VOCAL_PLUGINS__ = {
      React,
      Link,
      useParams,
      register: (configuration: ModuleConfiguration) => {
        const parsed = loadModules([{ configuration }]);
        setDynamicConfigs((prev) => [...prev, parsed]);
      },
    };
  }, [pluginsActive]);

  useEffect(() => {
    if (!pluginFrontEntries) return;
    pluginFrontEntries.data.forEach((entry) => {
      const script = document.createElement('script');
      script.src = entry.attributes.url;
      script.async = true;
      const markDone = () => setLoadedScriptCount((n) => n + 1);
      script.addEventListener('load', markDone);
      script.addEventListener('error', markDone);
      document.head.appendChild(script);
    });
  }, [pluginFrontEntries]);

  const merged = useMemo(
    () => mergeParsedConfigs(staticModuleConfiguration, ...dynamicConfigs),
    [dynamicConfigs]
  );

  const ready =
    !pluginsActive ||
    !pluginFrontEntries ||
    loadedScriptCount >= pluginFrontEntries.data.length;

  return (
    <PluginsContext.Provider value={{ merged, ready }}>
      {children}
    </PluginsContext.Provider>
  );
};

export default PluginsProvider;
