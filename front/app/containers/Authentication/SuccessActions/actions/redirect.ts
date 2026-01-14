import { RouteType } from 'routes';

import clHistory from 'utils/cl-router/history';

export interface RedirectParams {
  path: RouteType;
}

export const redirect = ({ path }: RedirectParams) => {
  return () => {
    clHistory.push(path);
  };
};
