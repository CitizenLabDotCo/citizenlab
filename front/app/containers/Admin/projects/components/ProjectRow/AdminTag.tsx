import React from 'react';
import { colors } from 'utils/styleUtils';
import { StyledStatusLabel } from '.';
import ConditionalWrapper from 'components/ConditionalWrapper';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import Link from 'utils/cl-router/Link';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

interface Props {
  userCanModerateProject: boolean;
  projectId: string;
}

const AdminTag = ({ userCanModerateProject, projectId }: Props) => {
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
        text={<FormattedMessage {...messages.onlyAdminsCanView} />}
        backgroundColor={colors.teal}
        icon="lock"
      />
    </ConditionalWrapper>
  );
};

export default AdminTag;
