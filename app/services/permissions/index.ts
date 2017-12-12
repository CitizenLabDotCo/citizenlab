import { authUserStream } from 'services/auth';
import { IUser } from 'services/users';


interface IResourceData {
  type: string;
}

interface IPermissionRule {
  (resource: IResourceData, user: IUser, context?: any) : boolean;
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

const hasPermission = async ({ item, action } : {item: IResourceData | string, action: string, user?: IUser }): Promise<boolean> => {
  const user = authUserStream().observable.toPromise();

  return user.then((user) => {
    const resourceType = isResource(item) ? item.type : item;
    const rule = getPermissionRule(resourceType, action);
    return rule && rule(item, user);
  });
};

export {
  definePermissionRule,
  hasPermission,
};
