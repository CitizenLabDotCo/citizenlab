import React, { useState } from 'react';

import useSharesInputForm from 'containers/Admin/projects/project/inputForm/useSharesInputForm';

import FormInputEditWarningModal from 'components/admin/FormInputEditWarningModal';

import clHistory from 'utils/cl-router/history';

/**
 * Opens the input form editor, first warning when the form is shared with
 * other phases. Render `warningModal` next to the button that calls `open`.
 */
const useOpenInputForm = (projectId: string, phaseId: string) => {
  const [warningOpened, setWarningOpened] = useState(false);
  const sharesForm = useSharesInputForm(projectId, phaseId);
  const editFormLink = `/admin/projects/${projectId}/phases/${phaseId}/form/edit`;

  return {
    // Until we know whether to warn, opening could skip the warning.
    ready: sharesForm !== undefined,
    open: () =>
      sharesForm ? setWarningOpened(true) : clHistory.push(editFormLink),
    warningModal: (
      <FormInputEditWarningModal
        variant="bo"
        showEditWarningModal={warningOpened}
        setShowEditWarningModal={setWarningOpened}
        editFormLink={editFormLink}
      />
    ),
  };
};

export default useOpenInputForm;
