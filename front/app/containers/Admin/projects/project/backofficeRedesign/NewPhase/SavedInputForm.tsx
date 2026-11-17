import React, { useState } from 'react';

import usePhases from 'api/phases/usePhases';

import useSharesInputForm from 'containers/Admin/projects/project/inputForm/useSharesInputForm';

import FormInputEditWarningModal from 'components/admin/FormInputEditWarningModal';

import Spinner from 'design-system/Spinner';

import Navigate from 'utils/cl-router/Navigate';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  phaseId: string;
}

const SavedInputForm = ({ projectId, phaseId }: Props) => {
  const { data: phases } = usePhases(projectId);
  const sharesForm = useSharesInputForm(projectId, phaseId);
  const [cancelled, setCancelled] = useState(false);

  if (cancelled) {
    return (
      <Navigate
        to="/admin/projects/$projectId/phases/$phaseId/setup"
        params={{ projectId, phaseId }}
        replace
      />
    );
  }

  // The create response can arrive before the phase list refresh finishes.
  if (
    !phases?.data.some((phase) => phase.id === phaseId) ||
    sharesForm === undefined
  ) {
    return <Spinner />;
  }

  if (sharesForm) {
    return (
      <FormInputEditWarningModal
        variant="panel"
        showEditWarningModal
        setShowEditWarningModal={(open) => setCancelled(!open)}
        editFormLink={`/admin/projects/${projectId}/phases/${phaseId}/form/edit`}
      />
    );
  }

  return (
    <Navigate
      to="/admin/projects/$projectId/phases/$phaseId/form/edit"
      params={{ projectId, phaseId }}
      replace
    />
  );
};

export default SavedInputForm;
