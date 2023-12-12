import React from 'react';
import { colors } from '@citizenlab/cl2-component-library';
import { StyledStatusLabel } from '.';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import Link from 'utils/cl-router/Link';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

interface Props {
  userCanModerateProject: boolean;
  projectId: string;
}

const StatusLabel = () => (
  <StyledStatusLabel
    text={<FormattedMessage {...messages.onlyAdminsCanView} />}
    backgroundColor={colors.teal}
    icon="lock"
  />
);

const AdminTag = ({ userCanModerateProject, projectId }: Props) => {
  if (userCanModerateProject) {
    return (
      <Link to={`${adminProjectsProjectPath(projectId)}/permissions`}>
        <StatusLabel />
      </Link>
    );
  }

  return <StatusLabel />;
};

export default AdminTag;
