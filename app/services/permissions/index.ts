import { authUserStream } from 'services/auth';
import { IUser } from 'services/users';

interface IResourceData {
  type: string;
}

interface IPermissionRule {
  (resource: IResourceData | TResourceType, user: IUser | null, context?: any) : boolean;
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
  return 'type' in object;
};

const definePermissionRule = (resourceType: TResourceType, action: TAction, rule: IPermissionRule) => {
  permissionRules[resourceType] = { ...(permissionRules[resourceType] || {}), action: rule };
};

const getPermissionRule = (resourceType: TResourceType, action: TAction) => (permissionRules[resourceType][action]);

/**
 *
 * @param param0.item The data item
 * @param param0.action The action to apply to the item, typically a verb
 * @param param0.context Optional context argument that can be used to pass in aditional context to make the permissions decision
 */
const hasPermission = async ({ item, action, context } : {item: IResourceData | string, action: string, user?: IUser, context?: any }): Promise<boolean> => {
  const user = authUserStream().observable.toPromise();

  return user.then((user) => {
    const resourceType = isResource(item) ? item.type : item;
    const rule = getPermissionRule(resourceType, action);
    if (rule) {
      return rule(item, user, context);
    } else {
      throw `No permission rule is specified on resource '${resourceType}' for action '${action}'`;
    }
  });
};

export {
  definePermissionRule,
  hasPermission,
};
