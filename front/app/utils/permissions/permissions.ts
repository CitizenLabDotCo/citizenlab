import { isObject } from 'lodash-es';

import { IAppConfigurationData } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import { IUser } from 'api/users/types';

export interface IRouteItem {
  type: 'route';
  path: string;
}

export type TPermissionItem = IResourceData | IRouteItem | TResourceType;
interface IResourceData {
  type: string;
  [key: string]: any;
}

type PermissionRule = (
  resource: TPermissionItem | null,
  user: IUser | undefined | null,
  tenant: IAppConfigurationData,
  context?: any
) => boolean;

type TResourceType = string;
type TAction = string;

const permissionRules: Record<
  TResourceType,
  Record<TAction, PermissionRule>
> = {};

const isResource = (object: any): object is IResourceData => {
  return isObject(object) && 'type' in object;
};

const definePermissionRule = (
  resourceType: TResourceType,
  action: TAction,
  rule: PermissionRule
) => {
  permissionRules[resourceType] = {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    ...(permissionRules[resourceType] || {}),
    [action]: rule,
  };
};

const getPermissionRule = (resourceType: TResourceType, action: TAction) => {
  return permissionRules[resourceType][action];
};

type PermissionParams = {
  item: TPermissionItem | null;
  action: string;
  context?: any;
};

// Non-hook version of usePermission, for checking many items at once.
const hasPermission = ({
  item,
  action,
  context,
  user,
  appConfig,
}: PermissionParams & {
  user: IUser | undefined | null;
  appConfig: IAppConfigurationData | undefined;
}) => {
  if (!item) {
    return false;
  }

  const resourceType = isResource(item) ? item.type : item;
  const rule = getPermissionRule(resourceType, action);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (rule && appConfig) {
    return rule(item, user, appConfig, context);
  } else {
    throw `No permission rule is specified on resource '${resourceType}' for action '${action}'`;
  }
};

const usePermission = ({ item, action, context }: PermissionParams) => {
  const { data: user } = useAuthUser();
  const { data: appConfig } = useAppConfiguration();

  return hasPermission({
    item,
    action,
    context,
    user,
    appConfig: appConfig?.data,
  });
};

export { definePermissionRule, hasPermission, usePermission };
