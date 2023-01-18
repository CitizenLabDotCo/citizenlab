import React, { FunctionComponent, ReactElement } from 'react';

import PageLoading from 'components/UI/PageLoading';
import { castArray, clamp, isNil, mergeWith, omitBy } from 'lodash-es';

import { InsertConfigurationOptions, ITab } from 'typings';
import { IntlFormatters } from 'react-intl';

export type ITabsOutlet = {
  formatMessage: IntlFormatters['formatMessage'];
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

export interface OutletsPropertyMap {}

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
