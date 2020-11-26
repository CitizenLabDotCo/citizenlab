import {
  LoadableLoadingAdmin,
  LoadableLoadingCitizen,
} from 'components/UI/LoadableLoading';

import { mergeWith, castArray } from 'lodash-es';

import { FunctionComponent } from 'react';

import Loadable from 'react-loadable';

export type OutletId =
  | 'app.containers.Navbar.projectlist.item'
  | 'app.containers.AdminPage.projects.all.projectsAndFolders.title'
  | 'app.containers.AdminPage.projects.all.projectsAndFolders.row'
  | 'app.containers.AdminPage.projects.all.projectsAndFolders.actions'
  | 'app.components.ProjectAndFolderCards.card'
  | 'app.containers.SiteMap.ProjectsSection.listitem'
  | 'app.containers.Admin.users.GroupsListPanel.listitem.icon'
  | 'app.containers.Admin.users.GroupCreationStep1.type'
  | 'app.containers.Admin.users.form'
  | 'app.containers.Admin.users.header'
  | 'app.containers.Admin.users.UsersGroup.form'
  | 'app.containers.Admin.users.UsersGroup.header'
  | 'app.containers.Admin.users.UsersHeader.icon';

export type Outlets = {
  [key in OutletId]?: FunctionComponent<any>;
};

export type MergedOutlets = {
  [key in OutletId]?: FunctionComponent<any>[];
};

interface RouteConfiguration {
  path?: string;
  name: string;
  container: () => Promise<any>;
  type?: string;
  indexRoute?: RouteConfiguration;
  childRoutes?: RouteConfiguration[];
}

interface Routes {
  citizen: RouteConfiguration[];
  admin: RouteConfiguration[];
}

export interface ModuleConfiguration {
  routes?: Routes;
  outlets?: Outlets;
}

type Modules = {
  configuration: ModuleConfiguration;
  isEnabled: boolean;
}[];

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

export const loadModules = (modules: Modules) => {
  const enabledModuleConfigurations = modules
    .filter((module) => module.isEnabled)
    .map((module) => module.configuration);

  const mergedRoutes: Routes = mergeWith(
    {},
    ...enabledModuleConfigurations.map(({ routes }) => routes),
    (objValue = [], srcValue = []) =>
      castArray(objValue).concat(castArray(srcValue))
  );

  const mergedOutlets: MergedOutlets = mergeWith(
    {},
    ...enabledModuleConfigurations.map(({ outlets }) => outlets),
    (objValue = [], srcValue = []) =>
      castArray(objValue).concat(castArray(srcValue))
  );

  return {
    outlets: mergedOutlets,
    routes: {
      citizen: parseModuleRoutes(mergedRoutes.citizen),
      admin: parseModuleRoutes(mergedRoutes.admin, RouteTypes.ADMIN),
    },
  };
};
