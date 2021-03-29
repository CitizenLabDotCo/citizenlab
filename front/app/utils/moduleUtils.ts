import { ILeafletMapConfig } from 'components/UI/LeafletMap/useLeaflet';
import {
  TSignUpStepConfigurationObject,
  TSignUpSteps,
} from 'components/SignUpIn/SignUp';

import {
  LoadableLoadingAdmin,
  LoadableLoadingCitizen,
} from 'components/UI/LoadableLoading';
import { GroupCreationModal } from 'containers/Admin/users';
import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { IProjectData, IUpdatedProjectProperties } from 'services/projects';
import { onProjectFormStateChange } from 'containers/Admin/projects/edit/general';
import { mergeWith, castArray, clamp } from 'lodash-es';

import { FunctionComponent } from 'react';

import Loadable from 'react-loadable';
import { IGroupDataAttributes, MembershipType } from 'services/groups';
import { ParticipationMethod } from 'services/participationContexts';
import {
  CellConfiguration,
  FormikSubmitHandler,
  InsertConfigurationOptions,
  ITab,
  MessageDescriptor,
  Multiloc,
} from 'typings';
import { IMapProps } from './../components/Map/index';
import { IUserData } from 'services/users';
import { MessageValue } from 'react-intl';
import { NavItem } from 'containers/Admin/sideBar';
import { IAppConfigurationSettingsCore } from 'services/appConfiguration';
import { ManagerType } from 'components/admin/PostManager';
import { IdeaCellComponentProps } from 'components/admin/PostManager/components/PostTable/IdeaRow';
import { IdeaHeaderCellComponentProps } from 'components/admin/PostManager/components/PostTable/IdeaHeaderRow';
import { IVerificationMethod } from 'services/verificationMethods';
import { ProjectTabOptions } from 'containers/Admin/projects/edit';

type Localize = (
  multiloc: Multiloc | null | undefined,
  maxChar?: number | undefined
) => string;

export type ITabsOutlet = {
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: { [key: string]: MessageValue } | undefined
  ) => string;
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

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
  'app.containers.Admin.dashboard.users.graphs': {
    startAt?: string | null;
    endAt: string | null;
    currentGroupFilter?: string;
    currentGroupFilterLabel?: string;
  };
  'app.components.SignUpIn.SignUp.step': {
    onData: (data: {
      key: TSignUpSteps;
      configuration: TSignUpStepConfigurationObject;
    }) => void;
    step: TSignUpSteps | null;
    onCompleted: () => void;
  };
  'app.containers.Admin.dashboard.reports.ProjectReport.graphs': {
    startAt: string;
    endAt: string;
    participationMethods: ParticipationMethod[];
    project: IProjectData;
  };
  'app.containers.IdeasShow.MetaInformation': {
    ideaId: string;
  };
  'app.containers.UserEditPage.ProfileForm.forms': {
    authUser: IUserData;
    onChange: () => void;
    onSubmit: (data: { key: string; formData: Object }) => void;
    onData: (data: { key: string; data: Object }) => void;
  };
  'app.containers.Admin.project.edit.permissions': {
    project: IProjectData;
  };
  'app.containers.Admin.ideas.tabs': {
    onData: (data: InsertConfigurationOptions<ITab>) => void;
  };
  'app.containers.Admin.projects.edit': {
    onData: (data: ProjectTabOptions<InsertConfigurationOptions<ITab>>) => void;
  };
  'app.containers.Admin.settings.tabs': {
    onData: (data: InsertConfigurationOptions<ITab>) => void;
  };
  'app.containers.Admin.initiatives.tabs': ITabsOutlet;
  'app.containers.Admin.dashboards.tabs': ITabsOutlet;
  'app.containers.Admin.sideBar.navItems': {
    onData: (data: InsertConfigurationOptions<NavItem>) => void;
  };
  'app.components.admin.PostManager.topActionBar': {
    assignee?: string | null;
    projectId?: string | null;
    handleAssigneeFilterChange: (value: string) => void;
    type: ManagerType;
  };
  'app.components.admin.PostManager.components.PostTable.IdeaRow.cells': {
    onData: (
      data: InsertConfigurationOptions<
        CellConfiguration<IdeaCellComponentProps>
      >
    ) => void;
  };
  'app.components.admin.PostManager.components.PostTable.IdeaHeaderRow.cells': {
    onData: (
      data: InsertConfigurationOptions<
        CellConfiguration<IdeaHeaderCellComponentProps>
      >
    ) => void;
  };
  'app.components.Map.leafletConfig': IMapProps & {
    leafletConfig: ILeafletMapConfig;
    onLeafletConfigChange: (data: ILeafletMapConfig) => void;
  };
  'app.components.Map.Legend': {
    projectId?: string | null;
    className?: string;
  };
  'app.containers.Admin.settings.registration': {};
  'app.containers.Admin.settings.registrationHelperText': {
    onChange: (propertyName: string) => (multiloc: Multiloc) => void;
    latestAppConfigCoreSettings?:
      | IAppConfigurationSettingsCore
      | Partial<IAppConfigurationSettingsCore>;
  };
  'app.components.VerificationModal.button': {
    method: IVerificationMethod;
    onMethodSelected: () => void;
    last: boolean;
  };
  'app.components.VerificationModal.methodStep': {
    method: IVerificationMethod;
    onCancel: () => void;
    onVerified: () => void;
    showHeader?: boolean;
    inModal: boolean;
  };
};

type Outlet<Props> = FunctionComponent<Props> | FunctionComponent<Props>[];

type OutletComponents<O> = {
  [K in keyof O]?: Outlet<O[K]>;
};

export type Outlets = OutletComponents<OutletsPropertyMap>;

export type OutletId = keyof Outlets;

export type RouteConfiguration = {
  path?: string;
  name?: string;
  container: () => Promise<any>;
  type?: string;
  indexRoute?: RouteConfiguration;
  childRoutes?: RouteConfiguration[];
};

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
  'admin.projects': RouteConfiguration[];
  'admin.initiatives': RouteConfiguration[];
  'admin.ideas': RouteConfiguration[];
  'admin.dashboards': RouteConfiguration[];
  'admin.settings': RouteConfiguration[];
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
      citizen: parseModuleRoutes(mergedRoutes?.citizen),
      admin: parseModuleRoutes(mergedRoutes?.admin, RouteTypes.ADMIN),
      'admin.initiatives': parseModuleRoutes(
        mergedRoutes?.['admin.initiatives'],
        RouteTypes.ADMIN
      ),
      'admin.ideas': parseModuleRoutes(
        mergedRoutes?.['admin.ideas'],
        RouteTypes.ADMIN
      ),
      'admin.dashboards': parseModuleRoutes(
        mergedRoutes?.['admin.dashboards'],
        RouteTypes.ADMIN
      ),
      'admin.projects': parseModuleRoutes(
        mergedRoutes?.['admin.projects'],
        RouteTypes.ADMIN
      ),
      'admin.settings': parseModuleRoutes(
        mergedRoutes?.['admin.settings'],
        RouteTypes.ADMIN
      ),
    },
    beforeMountApplication: callLifecycleMethods('beforeMountApplication'),
    afterMountApplication: callLifecycleMethods('afterMountApplication'),
  };
};

export const insertConfiguration = <T extends { name: string }>({
  configuration,
  insertAfterName,
  insertBeforeName,
}: InsertConfigurationOptions<T>) => (items: T[]): T[] => {
  const foundIndex = items.findIndex(
    (item) => item.name === (insertAfterName || insertBeforeName)
  );
  const insertIndex = clamp(
    insertAfterName ? foundIndex + 1 : foundIndex - 1,
    0,
    items.length
  );

  return insertIndex >= 0
    ? [
        ...items.slice(0, insertIndex),
        configuration,
        ...items.slice(insertIndex),
      ]
    : [...items, configuration];
};
