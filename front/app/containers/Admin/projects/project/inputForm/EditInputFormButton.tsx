import React, { useState } from 'react';

import FormInputEditWarningModal from 'components/admin/FormInputEditWarningModal';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';
import useSharesInputForm from './useSharesInputForm';

interface Props {
  projectId: string;
  phaseId: string;
  editFormLink: string;
}

const EditInputFormButton = ({ projectId, phaseId, editFormLink }: Props) => {
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);
  const shouldShowWarning = useSharesInputForm(projectId, phaseId);

  if (shouldShowWarning === undefined) {
    return null;
  }

  return (
    <>
      <ButtonWithLink
        mr="8px"
        onClick={() => {
          shouldShowWarning
            ? setShowEditWarningModal(true)
            : clHistory.push(editFormLink);
        }}
        width="auto"
        icon="edit"
        data-cy="e2e-edit-input-form"
        buttonStyle="admin-dark"
      >
        <FormattedMessage {...messages.editInputForm} />
      </ButtonWithLink>
      <FormInputEditWarningModal
        showEditWarningModal={showEditWarningModal}
        setShowEditWarningModal={setShowEditWarningModal}
        editFormLink={editFormLink}
      />
    </>
  );
};

export default EditInputFormButton;
