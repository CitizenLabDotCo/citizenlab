import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

// Whether the current user can moderate the given project. Used to gate the
// builder's empty-state placeholders so they only show to admins/moderators
// (in the builder, the admin preview, and when an admin views the live page),
// never to regular residents.
const useCanModerateProject = (projectId?: string) => {
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();

  if (!project) {
    return false;
  }

  return canModerateProject(project.data, authUser);
};

export default useCanModerateProject;
