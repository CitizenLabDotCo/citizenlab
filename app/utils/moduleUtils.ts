import {
  LoadableLoadingAdmin,
  LoadableLoadingCitizen,
} from 'components/UI/LoadableLoading';
import { GroupCreationModal } from 'containers/Admin/users';
import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { IProjectData, IUpdatedProjectProperties } from 'services/projects';
import { onProjectFormStateChange } from 'containers/Admin/projects/edit/general';
import { mergeWith, castArray } from 'lodash-es';

import { FunctionComponent } from 'react';

import Loadable from 'react-loadable';
import { IGroupDataAttributes, MembershipType } from 'services/groups';
import {
  FormikSubmitHandler,
  InsertTabOptions,
  ITab,
  MessageDescriptor,
  Multiloc,
} from 'typings';
import { IUserData } from 'services/users';
import { MessageValue } from 'react-intl';
import { NavItem } from 'containers/Admin/sideBar';

type Localize = (
  multiloc: Multiloc | null | undefined,
  maxChar?: number | undefined
) => string;

export type OutletsPropertyMap = {
  'app.containers.Navbar.projectlist.item': {
    publication: IAdminPublicationContent;
    localize: Localize;
  };
  'app.containers.Navbar.projectsAndFolders.title': {};
  'app.containers.AdminPage.projects.all.projectsAndFolders.row': {
    publication: IAdminPublicationContent;
  };
  'app.containers.AdminPage.projects.all.projectsAndFolders.title': {};
  'app.components.AdminPage.projects.form.additionalInputs.inputs': {
    projectAttrs: IUpdatedProjectProperties;
    onChange: onProjectFormStateChange;
    authUser: IUserData;
  };
  'app.containers.AdminPage.projects.all.createProjectNotAdmin': {};
  'app.containers.AdminPage.projects.all.projectsAndFolders.actions': {};
  'app.components.ProjectAndFolderCards.card': {
    publication: IAdminPublicationContent;
    size: 'small' | 'medium' | 'large';
    layout: 'dynamic' | 'threecolumns' | 'twocolumns';
  };
  'app.containers.SiteMap.ProjectsSection.listitem': {
    adminPublication: IAdminPublicationContent;
    hightestTitle: 'h3' | 'h4';
  };
  'app.containers.Admin.users.GroupsListPanel.listitem.icon': {
    type: MembershipType;
  };
  'app.containers.Admin.users.GroupCreationStep1.type': {
    onClick: (groupType: MembershipType) => () => void;
    formattedLink: string;
  };
  'app.containers.Admin.users.form': {
    type: GroupCreationModal;
    onSubmit: FormikSubmitHandler<NormalFormValues>;
    isVerificationEnabled: boolean;
  };
  'app.containers.Admin.users.header': {
    type: GroupCreationModal;
  };
  'app.containers.Admin.users.UsersGroup.form': {
    initialValues: IGroupDataAttributes;
    type: GroupCreationModal;
    onSubmit: FormikSubmitHandler<NormalFormValues>;
    isVerificationEnabled: boolean;
  };
  'app.containers.Admin.users.UsersGroup.header': {
    type: GroupCreationModal;
  };
  'app.containers.Admin.users.UsersHeader.icon': {
    type: GroupCreationModal;
  };
  'app.containers.Admin.project.edit.permissions': {
    project: IProjectData;
  };
  'app.containers.Admin.initiatives.tabs': {
    formatMessage: (
      messageDescriptor: MessageDescriptor,
      values?: { [key: string]: MessageValue } | undefined
    ) => string;
    onData: (data: InsertTabOptions) => void;
  };
  'app.containers.Admin.sideBar.navItems': {
    onData: (data: {
      insertAfterNavItemId?: string;
      navItemConfiguration: NavItem;
    }) => void;
  };
};

type Outlet<Props> = FunctionComponent<Props> | FunctionComponent<Props>[];

type OutletComponents<O> = {
  [K in keyof O]?: Outlet<O[K]>;
};

export type Outlets = OutletComponents<OutletsPropertyMap>;

export type OutletId = keyof Outlets;

export interface RouteConfiguration {
  path?: string;
  name?: string;
  container: () => Promise<any>;
  type?: string;
  indexRoute?: RouteConfiguration;
  childRoutes?: RouteConfiguration[];
}

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

interface Routes {
  citizen: RouteConfiguration[];
  admin: RouteConfiguration[];
  'admin.initiatives': RouteConfiguration[];
}

export interface ParsedModuleConfiguration {
  routes: Routes;
  outlets: Outlets;
  /** this function triggers before the Root component is mounted */
  beforeMountApplication: () => void;
  /** this function triggers after the Root component mounted */
  afterMountApplication: () => void;
}

export type ModuleConfiguration = RecursivePartial<
  ParsedModuleConfiguration
> & {
  /** this function triggers before the Root component is mounted */
  beforeMountApplication?: () => void;
  /** this function triggers after the Root component mounted */
  afterMountApplication?: () => void;
};
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
  routes: RouteConfiguration[] = [],
  type = RouteTypes.CITIZEN
) => routes.map((route) => convertConfigurationToRoute({ ...route, type }));

type LifecycleMethod = 'beforeMountApplication' | 'afterMountApplication';

export const loadModules = (modules: Modules): ParsedModuleConfiguration => {
  const enabledModuleConfigurations = modules
    .filter((module) => module.isEnabled)
    .map((module) => module.configuration);

  const mergedRoutes: Routes = mergeWith(
    {},
    ...enabledModuleConfigurations.map(({ routes }) => routes),
    (objValue = [], srcValue = []) =>
      castArray(objValue).concat(castArray(srcValue))
  );

  const mergedOutlets: Outlets = mergeWith(
    {},
    ...enabledModuleConfigurations.map(({ outlets }) => outlets),
    (objValue = [], srcValue = []) =>
      castArray(objValue).concat(castArray(srcValue))
  );

  const callLifecycleMethods = (lifecycleMethod: LifecycleMethod) => () => {
    enabledModuleConfigurations.forEach((module: ModuleConfiguration) =>
      module?.[lifecycleMethod]?.()
    );
  };

  return {
    outlets: mergedOutlets,
    routes: {
      citizen: parseModuleRoutes(mergedRoutes.citizen),
      admin: parseModuleRoutes(mergedRoutes.admin, RouteTypes.ADMIN),
      'admin.initiatives': parseModuleRoutes(
        mergedRoutes?.['admin.initiatives'],
        RouteTypes.ADMIN
      ),
    },
    beforeMountApplication: callLifecycleMethods('beforeMountApplication'),
    afterMountApplication: callLifecycleMethods('afterMountApplication'),
  };
};
