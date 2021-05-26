import { FunctionComponent } from 'react';
import { ILeafletMapConfig } from 'components/UI/LeafletMap/useLeaflet';
import {
  TSignUpStepConfigurationObject,
  TSignUpSteps,
} from 'components/SignUpIn/SignUp';

import {
  LoadableLoadingAdmin,
  LoadableLoadingCitizen,
} from 'components/UI/LoadableLoading';
import { ISignUpInMetaData } from 'components/SignUpIn';

import { GroupCreationModal } from 'containers/Admin/users';
import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { IProjectData, IUpdatedProjectProperties } from 'services/projects';
import { onProjectFormStateChange } from 'containers/Admin/projects/edit/general';
import { ITabItem } from 'components/UI/Tabs';
import { OutletRenderProps } from 'components/Outlet';
import { mergeWith, castArray, clamp } from 'lodash-es';

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
import {
  IAppConfigurationSettings,
  IAppConfigurationSettingsCore,
  IAppConfigurationStyle,
} from 'services/appConfiguration';
import { ManagerType } from 'components/admin/PostManager';
import { IdeaCellComponentProps } from 'components/admin/PostManager/components/PostTable/IdeaRow';
import { IdeaHeaderCellComponentProps } from 'components/admin/PostManager/components/PostTable/IdeaHeaderRow';
import { TTabName } from 'containers/Admin/projects/all/CreateProject';
import { IVerificationMethod } from 'services/verificationMethods';
import { IPhaseData } from 'services/phases';
import { GetInitiativeChildProps } from 'resources/GetInitiative';
import { GetLocaleChildProps } from 'resources/GetLocale';
import { ICommentData } from 'services/comments';
import { GetAppConfigurationLocalesChildProps } from 'resources/GetAppConfigurationLocales';
import { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import { GetIdeaChildProps } from 'resources/GetIdea';
import {
  IOnboardingCampaignNames,
  IOnboardingCampaigns,
} from 'services/onboardingCampaigns';

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

export type SignUpStepOutletProps = {
  onData: (data: {
    key: TSignUpSteps;
    configuration: TSignUpStepConfigurationObject;
  }) => void;
  step: TSignUpSteps | null;
  metaData: ISignUpInMetaData;
  onCompleted: () => void;
  onSkipped: () => void;
  onError: () => void;
};

export type IAdminSettingsRegistrationFormOutletProps = {
  onChange: (
    propertyName: string,
    submitOnChange?: boolean
  ) => (value: any) => void;
  latestAppConfigSettings?:
    | IAppConfigurationSettings
    | Partial<IAppConfigurationSettings>;
};

export type IAdminSettingsRegistrationFormPageOutletProps = {
  onChange: (propertyName: string) => (multiloc: Multiloc) => void;
  latestAppConfigCoreSettings?:
    | IAppConfigurationSettingsCore
    | Partial<IAppConfigurationSettingsCore>;
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
  'app.containers.Admin.projects.all.createProject': {
    selectedTabValue: TTabName;
  };
  'app.containers.Admin.projects.all.createProject.tabs': {
    onData: (data: InsertConfigurationOptions<ITabItem>) => void;
  };
  'app.components.SignUpIn.metaData': {
    metaData: ISignUpInMetaData | undefined;
  };
  'app.containers.Admin.projects.all.container': {
    onRender: (hasRendered: boolean) => void;
  };
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
  'app.components.SignUpIn.SignUp.step': SignUpStepOutletProps;
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
  'app.containers.Admin.project.edit.permissions.participationRights': {
    project: IProjectData;
    projectId: string;
    children: OutletRenderProps;
  };
  'app.containers.Admin.project.edit.permissions.moderatorRights': {
    projectId: string;
    children: OutletRenderProps;
  };
  'app.containers.Admin.projects.edit': {
    onData: (data: InsertConfigurationOptions<ITab>) => void;
    project: IProjectData;
    phases: IPhaseData[] | null;
  };
  'app.containers.Admin.settings.tabs': {
    onData: (data: InsertConfigurationOptions<ITab>) => void;
  };
  'app.containers.Admin.initiatives.tabs': ITabsOutlet;
  'app.containers.Admin.ideas.tabs': ITabsOutlet;
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
  'app.containers.Admin.guide.SetupSection': {};
  'app.components.Map.leafletConfig': IMapProps & {
    leafletConfig: ILeafletMapConfig;
    onLeafletConfigChange: (data: ILeafletMapConfig) => void;
  };
  'app.components.Map.Legend': {
    projectId?: string | null;
    className?: string;
  };
  'app.containers.Admin.settings.registration': {};
  'app.containers.Admin.settings.registrationHelperText': IAdminSettingsRegistrationFormPageOutletProps;
  'app.containers.Admin.settings.registrationBeginning': IAdminSettingsRegistrationFormOutletProps;
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
  'app.components.PostShowComponents.ActionBar.right': {
    translateButtonClicked: boolean;
    onClick: () => void;
    initiative: GetInitiativeChildProps;
    locale: GetLocaleChildProps;
  };
  'app.components.PostShowComponents.CommentFooter.left': {
    comment: ICommentData;
    locale: GetLocaleChildProps;
    tenantLocales: GetAppConfigurationLocalesChildProps;
  };
  'app.containers.InitiativesShow.left': {
    windowSize: GetWindowSizeChildProps;
    translateButtonClicked: boolean;
    onClick: () => void;
    initiative: GetInitiativeChildProps;
    locale: GetLocaleChildProps;
  };
  'app.containers.IdeasShow.left': {
    translateButtonClicked: boolean;
    onClick: () => void;
    idea: GetIdeaChildProps;
    locale: GetLocaleChildProps;
  };
  'app.components.PostShowComponents.CommentBody.translation': {
    translateButtonClicked: boolean;
    commentContent: string;
    locale: GetLocaleChildProps;
    commentId: string;
  };
  'app.components.PostShowComponents.Body.translation': {
    postId: string;
    body: string;
    locale: GetLocaleChildProps;
    translateButtonClicked?: boolean;
    postType: 'idea' | 'initiative';
  };
  'app.components.PostShowComponents.Title.translation': {
    postId: string;
    postType: 'idea' | 'initiative';
    title: string;
    locale?: GetLocaleChildProps;
    translateButtonClicked?: boolean;
    color?: string;
    align: 'left' | 'center';
  };
  'app.containers.UserEditPage.content': {};
  'app.containers.Navbar.UserMenu.UserNameContainer': {
    isVerified: boolean;
  };
  'app.containers.App.modals': { onMounted: (id: string) => void };
  'app.containers.LandingPage.onboardingCampaigns': {
    onboardingCampaigns: IOnboardingCampaigns;
    contentTimeout: number;
    contentDelay: number;
    authUser: IUserData;
    theme: unknown;
    onSkip: (name: IOnboardingCampaignNames) => void;
    onAccept: (name: IOnboardingCampaignNames) => void;
  };
  'app.containers.App.signUpInModal': {
    onMounted: (id: string) => void;
  };
  'app.containers.Admin.settings.customize.fields': {
    onChange: (key: string) => (value: unknown) => void;
    latestAppConfigStyleSettings?: IAppConfigurationStyle | null;
    theme: any;
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
  'admin.project_templates': RouteConfiguration[];
  'admin.settings': RouteConfiguration[];
}

export interface ParsedModuleConfiguration {
  routes: Routes;
  outlets: Outlets;
  /** this function triggers before the Root component is mounted */
  beforeMountApplication: () => void;
  /** this function triggers after the Root component mounted */
  afterMountApplication: () => void;
  /** used to reset streams created in a module */
  streamsToReset: string[];
}

export type ModuleConfiguration = RecursivePartial<
  ParsedModuleConfiguration
> & {
  /** this function triggers before the Root component is mounted */
  beforeMountApplication?: () => void;
  /** this function triggers after the Root component mounted */
  afterMountApplication?: () => void;
  /** used to reset streams created in a module */
  streamsToReset?: string[];
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
      'admin.project_templates': parseModuleRoutes(
        mergedRoutes?.['admin.project_templates'],
        RouteTypes.ADMIN
      ),
      'admin.settings': parseModuleRoutes(
        mergedRoutes?.['admin.settings'],
        RouteTypes.ADMIN
      ),
    },
    beforeMountApplication: callLifecycleMethods('beforeMountApplication'),
    afterMountApplication: callLifecycleMethods('afterMountApplication'),
    streamsToReset: enabledModuleConfigurations.reduce(
      (acc: string[], module: ModuleConfiguration) => {
        return [...acc, ...(module?.streamsToReset ?? [])];
      },
      []
    ),
  };
};

export const insertConfiguration = <T extends { name: string }>({
  configuration,
  insertAfterName,
  insertBeforeName,
}: InsertConfigurationOptions<T>) => (items: T[]): T[] => {
  const itemAlreadyInserted = items.some(
    (item) => item.name === configuration.name
  );
  const foundIndex = items.findIndex(
    (item) => item.name === (insertAfterName || insertBeforeName)
  );
  const insertIndex = clamp(
    insertAfterName ? foundIndex + 1 : foundIndex - 1,
    0,
    items.length
  );

  if (itemAlreadyInserted) {
    return [...items];
  } else {
    return insertIndex >= 0
      ? [
          ...items.slice(0, insertIndex),
          configuration,
          ...items.slice(insertIndex),
        ]
      : [...items, configuration];
  }
};
