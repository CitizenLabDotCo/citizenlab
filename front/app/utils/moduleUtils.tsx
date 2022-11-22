import {
  TSignUpStep,
  TSignUpStepConfigurationObject,
} from 'components/SignUpIn/SignUp';
import { ILeafletMapConfig } from 'components/UI/LeafletMap/useLeaflet';
import { Moment } from 'moment';
import React, {
  FunctionComponent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from 'react';

import { ISignUpInMetaData, TSignUpInFlow } from 'components/SignUpIn';
import PageLoading from 'components/UI/PageLoading';

import { OutletRenderProps } from 'components/Outlet';
import { ITabItem } from 'components/UI/Tabs';
import { GroupCreationModal } from 'containers/Admin/users';
import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { castArray, clamp, isNil, mergeWith, omitBy } from 'lodash-es';
import { IProjectData, IUpdatedProjectProperties } from 'services/projects';

import { ManagerType } from 'components/admin/PostManager';
import { IdeaHeaderCellComponentProps } from 'components/admin/PostManager/components/PostTable/header/IdeaHeaderRow';
import { IdeaCellComponentProps } from 'components/admin/PostManager/components/PostTable/Row/IdeaRow';
import { IResolution } from 'components/admin/ResolutionControl';
import { AuthProvider } from 'components/SignUpIn/AuthProviders';
import { Point } from 'components/UI/LeafletMap/typings';
import { TVerificationStep } from 'components/Verification/verificationModalEvents';
import { TTabName } from 'containers/Admin/projects/all/CreateProject';
import { TOnProjectAttributesDiffChangeFunction } from 'containers/Admin/projects/project/general';
import { NavItem } from 'containers/Admin/sideBar';
import { BannerButtonStyle } from 'components/LandingPages/citizen/BannerButton';
import { Localize } from 'hooks/useLocalize';
import { LatLngTuple } from 'leaflet';
import { GetAppConfigurationLocalesChildProps } from 'resources/GetAppConfigurationLocales';
import { GetIdeaChildProps } from 'resources/GetIdea';
import { GetInitiativeChildProps } from 'resources/GetInitiative';
import { GetLocaleChildProps } from 'resources/GetLocale';
import { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import {
  AppConfigurationFeature,
  CustomizedButtonConfig,
  TAppConfigurationSetting,
  TAppConfigurationSettingCore,
} from 'services/appConfiguration';
import { ICommentData } from 'services/comments';
import { IGroupDataAttributes, MembershipType } from 'services/groups';
import { THomepageBannerLayout } from 'services/homepageSettings';
import { TNotificationData } from 'services/notifications';
import {
  IOnboardingCampaignNames,
  IOnboardingCampaigns,
} from 'services/onboardingCampaigns';
import { ParticipationMethod } from 'services/participationContexts';
import { IPhaseData } from 'services/phases';
import { IUserData } from 'services/users';
import { TVerificationMethod } from 'services/verificationMethods';
import {
  CellConfiguration,
  InsertConfigurationOptions,
  ITab,
  Locale,
  Multiloc,
} from 'typings';
import { IntlFormatters } from 'react-intl';
import { StatCardProps } from '../modules/commercial/analytics/admin/hooks/useStatCard/typings';

export type ITabsOutlet = {
  formatMessage: IntlFormatters['formatMessage'];
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

export type SignUpStepOutletProps = {
  onData: (data: TSignUpStepConfigurationObject) => void;
  onDataLoaded: (step: TSignUpStep, loaded: boolean) => void;
  step: TSignUpStep | null;
  metaData: ISignUpInMetaData;
  onCompleted: () => void;
  onSkipped: () => void;
  onError: () => void;
};

export type IAdminSettingsRegistrationSectionEndOutletProps = {
  onSettingChange: (setting: TAppConfigurationSetting) => (value: any) => void;
  onCoreSettingWithMultilocChange: (
    coreSetting: TAppConfigurationSettingCore
  ) => (multiloc: Multiloc) => void;
  customFieldsSignupHelperTextMultiloc?: Multiloc | null;
  userConfirmationSetting?: AppConfigurationFeature;
};

export interface OutletsPropertyMap {
  'app.containers.Navbar.projectlist.item': {
    publication: IAdminPublicationContent;
    localize: Localize;
  };
  'app.containers.Navbar.projectsAndFolders.title': Record<string, any>;
  'app.containers.AdminPage.projects.all.projectsAndFolders.row': {
    publication: IAdminPublicationContent;
  };
  'app.containers.AdminPage.projects.all.projectsAndFolders.title': Record<
    string,
    any
  >;
  'app.components.AdminPage.projects.form.additionalInputs.inputs': {
    projectAttrs: IUpdatedProjectProperties;
    onProjectAttributesDiffChange: TOnProjectAttributesDiffChangeFunction;
  };
  'app.containers.AdminPage.projects.all.createProjectNotAdmin': Record<
    string,
    any
  >;
  'app.containers.AdminPage.projects.all.projectsAndFolders.actions': Record<
    string,
    any
  >;
  'app.containers.Admin.projects.all.createProject': {
    selectedTabValue: TTabName;
  };
  'app.containers.Admin.projects.all.createProject.tabs': {
    onData: (data: InsertConfigurationOptions<ITabItem>) => void;
  };
  'app.containers.Admin.projects.all.container': {
    onRender: (hasRendered: boolean) => void;
  };
  'app.containers.Admin.projects.edit.description.contentBuilder': {
    onMount: () => void;
    valueMultiloc: Multiloc | null | undefined;
    onChange: (description_multiloc: Multiloc, _locale: Locale) => void;
    label: string;
    labelTooltipText: string;
  };
  'app.ProjectsShowPage.shared.header.ProjectInfo.contentBuilder': {
    onMount: () => void;
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
    onSubmit: (values: NormalFormValues) => void;
    isVerificationEnabled: boolean;
  };
  'app.containers.Admin.users.header': {
    type: GroupCreationModal;
  };
  'app.containers.Admin.users.UsersGroup.form': {
    initialValues: IGroupDataAttributes;
    type: GroupCreationModal;
    onSubmit: (values: NormalFormValues) => void;
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
  'app.containers.Admin.dashboard.summary.inputStatus': {
    projectId: string | undefined;
    startAtMoment: Moment | null | undefined;
    endAtMoment: Moment | null;
    resolution: IResolution;
  };
  'app.containers.Admin.dashboard.summary.emailDeliveries': {
    projectId: string | undefined;
    startAtMoment: Moment | null | undefined;
    endAtMoment: Moment | null;
    resolution: IResolution;
  };
  'app.containers.Admin.dashboard.summary.projectStatus': StatCardProps;
  'app.containers.Admin.dashboard.summary.proposals': StatCardProps;
  'app.containers.Admin.dashboard.summary.invitations': StatCardProps;
  'app.containers.Admin.dashboard.summary.events': StatCardProps;
  'app.components.SignUpIn.SignUp.step': SignUpStepOutletProps;
  'app.containers.Admin.dashboard.reports.ProjectReport.graphs': {
    startAt: string;
    endAt: string;
    participationMethods: ParticipationMethod[];
    project: IProjectData;
  };
  'app.containers.IdeasShow.MetaInformation': {
    ideaId: string;
    compact?: boolean;
  };
  'app.containers.UserEditPage.ProfileForm.forms': {
    authUser: IUserData;
    onChange: (data: { key: string; formData: Record<string, any> }) => void;
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
  'app.components.Map.leafletConfig': {
    onLeafletConfigChange: (newLeafletConfig: ILeafletMapConfig) => void;
    projectId?: string | null;
    centerLatLng?: LatLngTuple;
    zoomLevel?: number;
    points?: Point[];
  };
  'app.components.Map.Legend': {
    projectId?: string | null;
    className?: string;
  };
  'app.containers.Admin.settings.registrationTabEnd': Record<string, any>;
  'app.containers.Admin.settings.registrationSectionEnd': IAdminSettingsRegistrationSectionEndOutletProps;
  'app.components.VerificationModal.buttons': {
    onClick: (method: TVerificationMethod) => void;
    verificationMethods: TVerificationMethod[];
  };
  'app.components.VerificationModal.methodSteps': {
    method: TVerificationMethod | null;
    onCancel: () => void;
    onVerified: () => void;
    showHeader?: boolean;
    inModal: boolean;
    activeStep: TVerificationStep;
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
  'app.containers.App.modals': { onMounted: (id: string) => void };
  'app.containers.HomePage.onboardingCampaigns': {
    onboardingCampaigns: IOnboardingCampaigns;
    contentTimeout: number;
    contentDelay: number;
    authUser: IUserData;
    theme: unknown;
    onSkip: (name: IOnboardingCampaignNames) => void;
    onAccept: (name: IOnboardingCampaignNames) => void;
  };
  'app.containers.Admin.settings.general.form': {
    onSettingChange: (settingName: string, settingValue: any) => void;
  };
  'app.modules.commercial.moderation.admin.containers.ModerationRow.content': {
    inappropriateContentFlagId: string | undefined;
  };
  'app.modules.commercial.moderation.admin.components.EmptyMessage': {
    isWarningsTabSelected: boolean;
  };
  'app.modules.commercial.moderation.admin.containers.actionbar.buttons': {
    selectedActiveFlagsCount: number;
    processing: boolean;
    onRemoveFlags: () => void;
    isWarningsTabSelected: boolean;
  };
  'app.modules.commercial.moderation.admin.containers.tabs': {
    onData: (data: InsertConfigurationOptions<ITabItem>) => void;
    activeFlagsCount: number;
  };
  'app.components.NotificationMenu.Notification': {
    notification: TNotificationData;
  };
  'app.containers.ProjectsShowPage.shared.header.ProjectHeader.GoBackButton': {
    projectFolderId: string;
    className?: string;
  };
  'app.containers.HomePage.EventsWidget': Record<string, any>;
  'app.containers.HomePage.SignedOutHeader.index': {
    homepageBannerLayout: THomepageBannerLayout;
  };
  'app.containers.Admin.pages-menu.index': Record<string, any>;
  'app.containers.Admin.pages-menu.NavigationSettings': Record<string, any>;
  'app.containers.HomePage.SignedOutHeader.CTA': {
    buttonStyle: BannerButtonStyle;
    signUpIn: (event: MouseEvent | KeyboardEvent) => void;
  };
  'app.containers.HomePage.SignedInHeader.CTA': {
    customizedButtonConfig?: CustomizedButtonConfig;
    buttonStyle: BannerButtonStyle;
  };
  'app.components.SignUpIn.AuthProviders.ContainerStart': {
    flow: TSignUpInFlow;
    onContinue: (authProvider: AuthProvider) => void;
  };
  'app.containers.Admin.projects.edit.general.components.TopicInputs.tooltipExtraCopy': Record<
    string,
    any
  >;
  'app.components.PageForm.index.top': {
    pageId: string | null;
    navbarItemId: string | null;
  };
}

type Outlet<Props> = FunctionComponent<Props> | FunctionComponent<Props>[];

type OutletComponents<O> = {
  [K in keyof O]?: Outlet<O[K]>;
};

export type Outlets = OutletComponents<OutletsPropertyMap>;

export type OutletId = keyof Outlets;

export type RouteConfiguration = {
  path?: string;
  name?: string;
  element?: ReactElement;
  type?: string;
  index?: boolean;
  children?: RouteConfiguration[];
};

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends Record<string, any>
    ? RecursivePartial<T[P]>
    : T[P];
};

interface Routes {
  citizen: RouteConfiguration[];
  admin: RouteConfiguration[];
  'admin.projects': RouteConfiguration[];
  'admin.projects.project': RouteConfiguration[];
  'admin.initiatives': RouteConfiguration[];
  'admin.ideas': RouteConfiguration[];
  'admin.pages-menu': RouteConfiguration[];
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

export type ModuleConfiguration =
  RecursivePartial<ParsedModuleConfiguration> & {
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
  element,
  type = RouteTypes.CITIZEN,
  index,
  children,
}: RouteConfiguration) => {
  const routeObject = {
    path,
    element: <PageLoading>{element}</PageLoading>,
    index,
    children:
      children &&
      children.length > 0 &&
      children.map((childRoute) =>
        convertConfigurationToRoute({ ...childRoute, type })
      ),
  };

  return omitBy(routeObject, isNil);
};

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

  const citizenRoutes = parseModuleRoutes(mergedRoutes?.citizen);
  const adminRoutes = parseModuleRoutes(mergedRoutes?.admin, RouteTypes.ADMIN);

  return {
    outlets: mergedOutlets,
    routes: {
      citizen: citizenRoutes,
      admin: adminRoutes,
      'admin.initiatives': parseModuleRoutes(
        mergedRoutes?.['admin.initiatives'],
        RouteTypes.ADMIN
      ),
      'admin.ideas': parseModuleRoutes(
        mergedRoutes?.['admin.ideas'],
        RouteTypes.ADMIN
      ),
      'admin.pages-menu': parseModuleRoutes(
        mergedRoutes?.['admin.pages-menu'],
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
      'admin.projects.project': parseModuleRoutes(
        mergedRoutes?.['admin.projects.project'],
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

export const insertConfiguration =
  <T extends { name: string }>({
    configuration,
    insertAfterName,
    insertBeforeName,
  }: InsertConfigurationOptions<T>) =>
  (items: T[]): T[] => {
    const itemAlreadyInserted = items.some(
      (item) => item.name === configuration.name
    );
    // index of item where we need to insert before/after
    const referenceIndex = items.findIndex(
      (item) => item.name === (insertAfterName || insertBeforeName)
    );
    const insertIndex = clamp(
      // if number is outside of lower and upper, it picks
      // the closes value. If it's inside the ranges, the
      // number is kept
      insertAfterName ? referenceIndex + 1 : referenceIndex,
      0,
      items.length
    );

    if (itemAlreadyInserted) {
      items.splice(insertIndex, 1);
    }

    const newItems = [
      ...items.slice(0, insertIndex),
      configuration,
      ...items.slice(insertIndex),
    ];

    return newItems;
  };
