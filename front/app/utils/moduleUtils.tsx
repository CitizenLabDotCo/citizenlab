import React, { FunctionComponent, ReactElement } from 'react';

import {
  castArray,
  clamp,
  isNil,
  mergeWith,
  omitBy,
  cloneDeep,
} from 'lodash-es';
import { IntlFormatters } from 'react-intl';
import {
  InsertConfigurationOptions,
  ITab,
  SupportedLocale,
  Multiloc,
} from 'typings';

import { IGroupDataAttributes, MembershipType } from 'api/groups/types';
import { IIdeaData } from 'api/ideas/types';
import { TNotificationData } from 'api/notifications/types';
import { TVerificationMethod } from 'api/verification_methods/types';

import { TTabName } from 'containers/Admin/projects/new';
import { NavItem } from 'containers/Admin/sideBar/navItems';
import { GroupCreationModal } from 'containers/Admin/users';
import { NormalFormValues } from 'containers/Admin/users/NormalGroupForm';
import { AuthProvider } from 'containers/Authentication/steps/AuthProviders';
import { TVerificationStep } from 'containers/Authentication/steps/Verification/utils';
import { SignUpInFlow } from 'containers/Authentication/typings';

import { ManagerType } from 'components/admin/PostManager';
import { OutletRenderProps } from 'components/Outlet';
import PageLoading from 'components/UI/PageLoading';
import { ITabItem } from 'components/UI/Tabs';

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
  'app.containers.Admin.projects.edit.description.projectDescriptionBuilder': {
    onMount: () => void;
    valueMultiloc: Multiloc | null | undefined;
    onChange: (
      description_multiloc: Multiloc,
      _locale: SupportedLocale
    ) => void;
    label: string;
    labelTooltipText: string;
  };
  'app.ProjectsShowPage.shared.header.ProjectInfo.projectDescriptionBuilder': {
    id: string;
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
  'app.containers.IdeasShow.MetaInformation': {
    ideaId: string;
    compact?: boolean;
  };
  'app.containers.Admin.project.edit.permissions.moderatorRights': {
    projectId: string;
    children: OutletRenderProps;
  };
  'app.containers.Admin.ideas.tabs': ITabsOutlet;
  'app.containers.Admin.sideBar.navItems': {
    onData: (data: InsertConfigurationOptions<NavItem>) => void;
  };
  'app.components.admin.PostManager.topActionBar': {
    assignee?: string | null;
    projectId?: string | null;
    handleAssigneeFilterChange: (value: string | undefined) => void;
    type: ManagerType;
  };
  'app.components.VerificationModal.buttons': {
    onClick: (method: TVerificationMethod) => void;
    verificationMethods: TVerificationMethod[];
  };
  'app.components.VerificationModal.methodSteps': {
    method: TVerificationMethod | null;
    onCancel: () => void;
    onVerified: () => void;
    activeStep: TVerificationStep;
  };
  'app.components.PostShowComponents.CommentFooter.left': {
    commentId: string;
  };

  'app.containers.IdeasShow.left': {
    translateButtonClicked: boolean;
    onClick: () => void;
    idea: IIdeaData;
    locale: SupportedLocale;
  };
  'app.components.PostShowComponents.CommentBody.translation': {
    translateButtonClicked: boolean;
    commentContent: string;
    commentId: string;
  };
  'app.components.PostShowComponents.Body.translation': {
    postId: string;
    body: string;
    translateButtonClicked?: boolean;
  };
  'app.components.PostShowComponents.Title.translation': {
    postId: string;
    title: string;
    translateButtonClicked?: boolean;
    color?: string;
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
  'app.components.SignUpIn.AuthProviders.ContainerStart': {
    flow: SignUpInFlow;
    onContinue: (authProvider: AuthProvider) => void;
  };
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
  'admin.ideas': RouteConfiguration[];
  'admin.pages-menu': RouteConfiguration[];
  'admin.dashboards': RouteConfiguration[];
  'admin.project_templates': RouteConfiguration[];
  'admin.settings': RouteConfiguration[];
  'admin.tools': RouteConfiguration[];
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
  const moduleConfigurations = modules.map((module) => module.configuration);

  const mergedRoutes: Routes = mergeWith(
    {},
    ...moduleConfigurations.map(({ routes }) => routes),
    (objValue = [], srcValue = []) =>
      castArray(objValue).concat(castArray(srcValue))
  );

  const mergedOutlets: Outlets = mergeWith(
    {},
    ...moduleConfigurations.map(({ outlets }) => outlets),
    (objValue = [], srcValue = []) =>
      castArray(objValue).concat(castArray(srcValue))
  );

  const callLifecycleMethods = (lifecycleMethod: LifecycleMethod) => () => {
    moduleConfigurations.forEach((module: ModuleConfiguration) =>
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      module?.[lifecycleMethod]?.()
    );
  };

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const citizenRoutes = parseModuleRoutes(mergedRoutes?.citizen);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const adminRoutes = parseModuleRoutes(mergedRoutes?.admin, RouteTypes.ADMIN);

  return {
    outlets: mergedOutlets,
    routes: {
      citizen: citizenRoutes,
      admin: adminRoutes,
      'admin.ideas': parseModuleRoutes(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mergedRoutes?.['admin.ideas'],
        RouteTypes.ADMIN
      ),
      'admin.pages-menu': parseModuleRoutes(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mergedRoutes?.['admin.pages-menu'],
        RouteTypes.ADMIN
      ),
      'admin.dashboards': parseModuleRoutes(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mergedRoutes?.['admin.dashboards'],
        RouteTypes.ADMIN
      ),
      'admin.projects': parseModuleRoutes(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mergedRoutes?.['admin.projects'],
        RouteTypes.ADMIN
      ),
      'admin.project_templates': parseModuleRoutes(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mergedRoutes?.['admin.project_templates'],
        RouteTypes.ADMIN
      ),
      'admin.settings': parseModuleRoutes(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mergedRoutes?.['admin.settings'],
        RouteTypes.ADMIN
      ),
      'admin.tools': parseModuleRoutes(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mergedRoutes?.['admin.tools'],
        RouteTypes.ADMIN
      ),
      'admin.reporting': parseModuleRoutes(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mergedRoutes?.['admin.reporting'],
        RouteTypes.ADMIN
      ),
    },
    beforeMountApplication: callLifecycleMethods('beforeMountApplication'),
    afterMountApplication: callLifecycleMethods('afterMountApplication'),
    streamsToReset: moduleConfigurations.reduce(
      (acc: string[], module: ModuleConfiguration) => {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    const itemsClone = cloneDeep(items);
    const itemAlreadyInserted = itemsClone.some(
      (item) => item.name === configuration.name
    );
    // index of item where we need to insert before/after
    const referenceIndex = itemsClone.findIndex(
      (item) => item.name === (insertAfterName || insertBeforeName)
    );
    const insertIndex = clamp(
      // if number is outside of lower and upper, it picks
      // the closes value. If it's inside the ranges, the
      // number is kept
      insertAfterName ? referenceIndex + 1 : referenceIndex,
      0,
      itemsClone.length
    );
    const itemAtInsertIndex = itemsClone[insertIndex];
    const isItemInsertedBefore =
      itemAlreadyInserted &&
      insertBeforeName &&
      insertIndex &&
      itemAtInsertIndex.name === insertBeforeName &&
      itemsClone[insertIndex - 1].name === configuration.name;
    const isItemInsertedAfter =
      itemAlreadyInserted &&
      insertAfterName &&
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      itemAtInsertIndex &&
      itemAtInsertIndex.name === insertAfterName;

    // If item is already inserted then let's not do anything
    if (isItemInsertedBefore || isItemInsertedAfter) {
      return itemsClone;
    }

    if (itemAlreadyInserted) {
      itemsClone.splice(
        itemsClone.findIndex((item) => item.name === configuration.name),
        1
      );
    }

    const newItems = [
      ...itemsClone.slice(0, insertIndex),
      configuration,
      ...itemsClone.slice(insertIndex),
    ];

    return newItems;
  };
