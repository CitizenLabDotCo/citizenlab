import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
import { StyledStatusLabel } from '.';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import useProjectGroups from 'hooks/useProjectGroups';
import Link from 'utils/cl-router/Link';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

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
  const projectGroups = useProjectGroups({
    projectId,
  });

  if (isNilOrError(projectGroups)) {
    return null;
  }

  const groupCount = projectGroups.length;

  if (userCanModerateProject) {
    return (
      <Link to={`${adminProjectsProjectPath(projectId)}/permissions`}>
        <StatusLabel groupCount={groupCount} />
      </Link>
    );
  }

  return <StatusLabel groupCount={groupCount} />;
};

export default GroupsTag;
