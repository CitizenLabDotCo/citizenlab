import { authUserStream } from 'services/auth';
import { IUser } from 'services/users';
import { isObject } from 'lodash-es';
import { combineLatest } from 'rxjs';
import {
  currentAppConfigurationStream,
  IAppConfigurationData,
} from 'services/appConfiguration';
import { map } from 'rxjs/operators';

export type TPermissionItem = IResourceData | IRouteItem | TResourceType;

interface IResourceData {
  type: string;
  [key: string]: any;
}

export interface IRouteItem {
  type: 'route';
  path: string;
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
  return combineLatest(
    authUserStream().observable,
    currentAppConfigurationStream().observable
  ).pipe(
    map(([user, tenant]) => {
      if (!item) {
        return false;
      }

      const resourceType = isResource(item) ? item.type : item;
      const rule = getPermissionRule(resourceType, action);

      if (rule) {
        return rule(item, user, tenant.data, context);
      } else {
        throw `No permission rule is specified on resource '${resourceType}' for action '${action}'`;
      }
    })
  );
};

export { definePermissionRule, hasPermission };
