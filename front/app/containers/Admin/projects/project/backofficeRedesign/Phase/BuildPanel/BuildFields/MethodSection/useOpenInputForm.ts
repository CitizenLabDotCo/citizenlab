import { useCallback, useState } from 'react';

import useSharesInputForm from 'containers/Admin/projects/project/inputForm/useSharesInputForm';

import clHistory from 'utils/cl-router/history';

/**
 * Opens the input form editor, first warning when the form is shared with
 * other phases. Render a `FormInputEditWarningModal` next to the button that
 * calls `open`, fed with `warningOpened`, `setWarningOpened` and `editFormLink`.
 */
const useOpenInputForm = (projectId: string, phaseId: string) => {
  const [warningOpened, setWarningOpened] = useState(false);
  const sharesForm = useSharesInputForm(projectId, phaseId);
  const editFormLink = `/admin/projects/${projectId}/phases/${phaseId}/form/edit`;

  const open = useCallback(() => {
    if (sharesForm) {
      setWarningOpened(true);
    } else {
      clHistory.push(editFormLink);
    }
  }, [editFormLink, sharesForm]);

  return {
    // Until we know whether to warn, opening could skip the warning.
    ready: sharesForm !== undefined,
    open,
    warningOpened,
    setWarningOpened,
    editFormLink,
  };
};

export default useOpenInputForm;
