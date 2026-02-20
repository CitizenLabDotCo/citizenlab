import { RouteType } from 'routes';

import { addFollower } from 'api/follow_unfollow/useAddFollower';

import clHistory from 'utils/cl-router/history';

export interface FollowProjectAndRedirectParams {
  projectId: string;
  path: RouteType;
}

export const followProjectAndRedirect = ({
  projectId,
  path,
}: FollowProjectAndRedirectParams) => {
  return async () => {
    await addFollower({ followableType: 'projects', followableId: projectId });

    clHistory.push(path);
  };
};
