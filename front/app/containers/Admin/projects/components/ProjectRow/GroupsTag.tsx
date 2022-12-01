import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
import { StyledStatusLabel } from '.';
import ConditionalWrapper from 'components/ConditionalWrapper';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import useProjectGroups from 'hooks/useProjectGroups';
import Link from 'utils/cl-router/Link';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

interface Props {
  projectId: string;
  userCanModerateProject: boolean;
}

const GroupsTag = ({ projectId, userCanModerateProject }: Props) => {
  const projectGroups = useProjectGroups({
    projectId,
  });

  if (isNilOrError(projectGroups)) {
    return null;
  }

  return (
    <ConditionalWrapper
      condition={userCanModerateProject}
      wrapper={(children: React.ReactNode) => (
        <Link to={`${adminProjectsProjectPath(projectId)}/permissions`}>
          {children}
        </Link>
      )}
    >
      <StyledStatusLabel
        text={
          projectGroups.length > 0 ? (
            <FormattedMessage
              {...messages.xGroupsHaveAccess}
              values={{ groupCount: projectGroups.length }}
            />
          ) : (
            <FormattedMessage {...messages.onlyAdminsCanView} />
          )
        }
        backgroundColor={colors.teal}
        icon="lock"
      />
    </ConditionalWrapper>
  );
};

export default GroupsTag;
