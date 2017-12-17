import { find } from 'lodash';
import { IUser } from 'services/users';

const hasRole = (user: IUser, role) => {
  return !!(user.data.attributes.roles && user.data.attributes.roles.find((r) => r.type === role));
};

export const isAdmin = (user?: IUser): boolean  => {
  return !!user && hasRole(user, 'admin');
};
