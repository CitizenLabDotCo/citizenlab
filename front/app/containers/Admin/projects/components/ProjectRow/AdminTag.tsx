import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

import { StyledStatusLabel } from '.';

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
      <Link
        data-cy="e2e-admins-only-permissions-tag"
        to={`${adminProjectsProjectPath(projectId)}/settings/access-rights`}
      >
        <StatusLabel />
      </Link>
    );
  }

  return <StatusLabel />;
};

export default AdminTag;
