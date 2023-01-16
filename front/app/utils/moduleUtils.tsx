import React, { FunctionComponent, ReactElement } from 'react';

import PageLoading from 'components/UI/PageLoading';
import { ITabItem } from 'components/UI/Tabs';
import { GroupCreationModal } from 'containers/Admin/users';
import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';
import { castArray, clamp, isNil, mergeWith, omitBy } from 'lodash-es';
import { IProjectData } from 'services/projects';

import { TVerificationStep } from 'events/verificationModal';
import { TTabName } from 'containers/Admin/projects/all/CreateProject';
import { NavItem } from 'containers/Admin/sideBar';

import { IGroupDataAttributes, MembershipType } from 'services/groups';
import { TNotificationData } from 'services/notifications';
import { IPhaseData } from 'services/phases';
import { TVerificationMethod } from 'services/verificationMethods';
import { InsertConfigurationOptions, ITab, Locale, Multiloc } from 'typings';
import { IntlFormatters } from 'react-intl';

export type ITabsOutlet = {
  formatMessage: IntlFormatters['formatMessage'];
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

export interface OutletsPropertyMap {
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
  'app.containers.Admin.projects.edit': {
    onData: (data: InsertConfigurationOptions<ITab>) => void;
    project: IProjectData;
    phases: IPhaseData[] | null;
  };
  'app.containers.Admin.settings.tabs': {
    onData: (data: InsertConfigurationOptions<ITab>) => void;
  };
  'app.containers.Admin.sideBar.navItems': {
    onData: (data: InsertConfigurationOptions<NavItem>) => void;
  };
  'app.components.VerificationModal.methodSteps': {
    method: TVerificationMethod | null;
    onCancel: () => void;
    onVerified: () => void;
    showHeader?: boolean;
    inModal: boolean;
    activeStep: TVerificationStep;
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
  'app.containers.HomePage.EventsWidget': Record<string, any>;
  'app.containers.Admin.projects.edit.general.components.TopicInputs.tooltipExtraCopy': Record<
    string,
    any
  >;
  'app.containers.Admin.reporting.components.Tabs': {
    onData: (tabs: ITab[]) => void;
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
  'admin.reporting': RouteConfiguration[];
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
      'admin.reporting': parseModuleRoutes(
        mergedRoutes?.['admin.reporting'],
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
