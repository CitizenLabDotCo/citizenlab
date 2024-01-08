import React from 'react';
import useProjectGroups from 'api/project_groups/useProjectGroups';
import Link from 'utils/cl-router/Link';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';
import PermissionsTag from './PermissionsTag';

interface Props {
  projectId: string;
  userCanModerateProject: boolean;
}

const GroupsTag = ({ projectId, userCanModerateProject }: Props) => {
  const { data: projectGroups } = useProjectGroups({
    projectId,
  });

  if (!projectGroups) {
    return null;
  }

  const groupCount = projectGroups.data.length;

  if (userCanModerateProject) {
    return (
      <Link
        data-cy="e2e-groups-permissions-tag"
        to={`${adminProjectsProjectPath(projectId)}/settings/access-rights`}
      >
        <PermissionsTag groupCount={groupCount} />
      </Link>
    );
  }

  return <PermissionsTag groupCount={groupCount} />;
};

export default GroupsTag;
