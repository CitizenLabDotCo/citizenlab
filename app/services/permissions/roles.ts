import { find } from 'lodash';


const hasRole = (user, role) => {
  return !!user.attributes.roles.find((r) => r.type === role);
};

export const isAdmin = (user)  => {
  hasRole(user, 'admin');
};
