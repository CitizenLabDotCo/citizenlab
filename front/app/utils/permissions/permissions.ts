import authUserStream from 'api/me/authUserStream';
import { IUser } from 'api/users/types';
import { isObject } from 'lodash-es';
import { map } from 'rxjs/operators';
import useAuthUser from 'api/me/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

import {
  IAppConfiguration,
  IAppConfigurationData,
} from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import appConfigurationStream from 'api/app_configuration/appConfigurationStream';
export interface IRouteItem {
  type: 'route';
  path: string;
}

export type TPermissionItem = IResourceData | IRouteItem | TResourceType;
interface IResourceData {
  type: string;
  [key: string]: any;
}

interface IPermissionRule {
  (
    resource: TPermissionItem | null,
    user: IUser | null,
    tenant: IAppConfigurationData,
    context?: any
  ): boolean;
}

interface IPermissionRules {
  [key: string]: {
    [key: string]: IPermissionRule;
  };
}

type TResourceType = string;
type TAction = string;

const permissionRules: IPermissionRules = {};

const isResource = (object: any): object is IResourceData => {
  return isObject(object) && 'type' in object;
};

const definePermissionRule = (
  resourceType: TResourceType,
  action: TAction,
  rule: IPermissionRule
) => {
  permissionRules[resourceType] = {
    ...(permissionRules[resourceType] || {}),
    [action]: rule,
  };
};

const getPermissionRule = (resourceType: TResourceType, action: TAction) => {
  return permissionRules[resourceType][action];
};

let appConfiguration: IAppConfiguration | undefined = undefined;
appConfigurationStream.subscribe((appConfig) => {
  appConfiguration = appConfig;
});

/**
 *
 * @param param0.item The data item
 * @param param0.action The action to apply to the item, typically a verb
 * @param param0.context Optional context argument that can be used to pass in aditional context to make the permissions decision
 */
const hasPermission = ({
  item,
  action,
  context,
}: {
  item: TPermissionItem | null;
  action: string;
  context?: any;
}) => {
  return authUserStream.pipe(
    map((user) => {
      if (!item) {
        return false;
      }

      const resourceType = isResource(item) ? item.type : item;
      const rule = getPermissionRule(resourceType, action);

      if (rule && appConfiguration) {
        return rule(item, user || null, appConfiguration.data, context);
      } else {
        throw `No permission rule is specified on resource '${resourceType}' for action '${action}'`;
      }
    })
  );
};

const usePermission = ({
  item,
  action,
  context,
}: {
  item: TPermissionItem | null;
  action: string;
  context?: any;
}) => {
  const { data: user } = useAuthUser();
  const { data: appConfig } = useAppConfiguration();

  if (!item) {
    return false;
  }

  const resourceType = isResource(item) ? item.type : item;
  const rule = getPermissionRule(resourceType, action);

  if (rule) {
    return (
      !isNilOrError(user) &&
      !isNilOrError(appConfig) &&
      rule(item, user, appConfig?.data, context)
    );
  } else {
    throw `No permission rule is specified on resource '${resourceType}' for action '${action}'`;
  }
};

export { definePermissionRule, hasPermission, usePermission };
