import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import useProjectGroups from 'api/project_groups/useProjectGroups';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

import { StyledStatusLabel } from '.';

interface Props {
  projectId: string;
  userCanModerateProject: boolean;
}

const StatusLabel = ({ groupCount }: { groupCount: number }) => (
  <StyledStatusLabel
    text={
      groupCount > 0 ? (
        <FormattedMessage
          {...messages.xGroupsHaveAccess}
          values={{ groupCount }}
        />
      ) : (
        <FormattedMessage {...messages.onlyAdminsCanView} />
      )
    }
    backgroundColor={colors.teal}
    icon="lock"
  />
);

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
        to={`/admin/projects/${projectId}/general/access-rights`}
      >
        <StatusLabel groupCount={groupCount} />
      </Link>
    );
  }

  return <StatusLabel groupCount={groupCount} />;
};

export default GroupsTag;
