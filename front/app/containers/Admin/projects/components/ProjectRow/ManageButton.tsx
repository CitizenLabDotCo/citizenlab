import React from 'react';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { RowButton } from '../StyledComponents';

interface Props {
  isDisabled: boolean;
  publicationId: string;
}

const ManageButton = ({ isDisabled, publicationId }: Props) => {
  return (
    <RowButton
      className={`
      e2e-admin-edit-publication intercom-admin-project-edit-button
    `}
      linkTo={adminProjectsProjectPath(publicationId)}
      buttonStyle="secondary"
      icon="edit"
      type="button"
      key="manage"
      disabled={isDisabled}
      data-testid="project-row-edit-button"
    >
      <FormattedMessage {...messages.editButtonLabel} />
    </RowButton>
  );
};

export default ManageButton;
