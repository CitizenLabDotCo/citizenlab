import {
  LoadableLoadingAdmin,
  LoadableLoadingCitizen,
} from 'components/UI/LoadableLoading';

import { mergeWith } from 'lodash-es';

import { createElement, isValidElement } from 'react';

import Loadable from 'react-loadable';

export const RouteTypes = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
};

interface RouteConfiguration {
  path: string;
  name: string;
  container: () => Promise<any>;
  type?: string;
  indexRoute?: RouteConfiguration;
  childRoutes?: RouteConfiguration[];
}

const convertConfigurationToRoute = ({
  path,
  name,
  container: loader,
  type = RouteTypes.CITIZEN,
  indexRoute,
  childRoutes,
}: RouteConfiguration) => ({
  path,
  name,
  component: Loadable({
    loader,
    loading:
      type === RouteTypes.ADMIN ? LoadableLoadingAdmin : LoadableLoadingCitizen,
    delay: 500,
  }),
  indexRoute:
    indexRoute && convertConfigurationToRoute({ ...indexRoute, type }),
  childRoutes:
    childRoutes &&
    childRoutes.length > 0 &&
    childRoutes.map((childRoute) =>
      convertConfigurationToRoute({ ...childRoute, type })
    ),
});

const parseModuleRoutes = (
  routes: RouteConfiguration[],
  type = RouteTypes.CITIZEN
) => routes.map((route) => convertConfigurationToRoute({ ...route, type }));

const parseOutlets = (outlets = {}) =>
  Object.entries(outlets).reduce(
    (acc, [id, definitions]: [string, any]) => ({
      ...acc,
      [id]: definitions.map((definition) => {
        if (isValidElement(definition)) return definition;
        return createElement(definition);
      }),
    }),
    {}
  );

export const loadModules = (modules, outlets) => {
  const enabledModuleConfigurations = modules
    .filter((module) => module.enabled)
    .map((module) => module.configuration);

  const mergedRoutes = mergeWith(
    ...enabledModuleConfigurations.map(({ routes }) => routes),
    (objValue, srcValue) => objValue.concat(srcValue)
  );

  return {
    routes: {
      citizen: parseModuleRoutes(mergedRoutes.citizen),
      admin: parseModuleRoutes(mergedRoutes.admin, RouteTypes.ADMIN),
    },
    outlets: parseOutlets(outlets),
  };
};
