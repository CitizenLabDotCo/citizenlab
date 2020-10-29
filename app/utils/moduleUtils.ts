import {
  LoadableLoadingAdmin,
  LoadableLoadingCitizen,
} from 'components/UI/LoadableLoading';

import Loadable from 'react-loadable';

export const RouteTypes = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
};

const convertConfigurationToRoute = ({
  path,
  name,
  container: loader,
  type = RouteTypes.CITIZEN,
  indexRoute,
  childRoutes,
}) => ({
  path,
  name,
  component: Loadable({
    loader,
    loading:
      type === RouteTypes.ADMIN ? LoadableLoadingAdmin : LoadableLoadingCitizen,
    delay: 500,
  }),
  indexRoute: indexRoute
    ? convertConfigurationToRoute({ ...indexRoute, type })
    : undefined,
  childRoutes:
    childRoutes && childRoutes.length > 0
      ? childRoutes.map((childRoute) =>
          convertConfigurationToRoute({ ...childRoute, type })
        )
      : undefined,
});

export const parseModuleRoutes = (routes, type = RouteTypes.CITIZEN) =>
  routes.map((route) => convertConfigurationToRoute({ ...route, type }));

export const loadModules = (modules) => {
  const enabledModuleConfigurations = modules
    .filter((module) => module.enabled)
    .map((module) => module.configuration);

  return enabledModuleConfigurations.reduce(
    (mergedConfiguration, configuration) => {
      return {
        routes: {
          citizen: [
            ...mergedConfiguration.routes.citizen,
            ...configuration.routes.citizen,
          ],
          admin: [
            ...mergedConfiguration.routes.admin,
            ...configuration.routes.admin,
          ],
        },
      };
    },
    {
      routes: {
        citizen: [],
        admin: [],
      },
    }
  );
};
