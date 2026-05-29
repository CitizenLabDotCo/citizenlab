import React, { useState } from 'react';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import FormInputEditWarningModal from 'components/admin/FormInputEditWarningModal';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

interface Props {
  projectId: string;
  phaseId: string;
  editFormLink: string;
}

const FormInputEditButtonWithWarningModal = ({
  projectId,
  phaseId,
  editFormLink,
}: Props) => {
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);
  const { data: phase } = usePhase(phaseId);
  const { data: phases } = usePhases(projectId);

  if (!phase || !phases) {
    return null;
  }

  // Ideation and voting phases share a project-level input form,
  // so editing affects every such phase in the project.
  // Proposals phases have a phase-specific form and never share.
  const sharesProjectLevelForm = (method: string) =>
    method === 'ideation' || method === 'voting';
  const currentSharesForm = sharesProjectLevelForm(
    phase.data.attributes.participation_method
  );
  const sharingPhasesCount = phases.data.filter((p) =>
    sharesProjectLevelForm(p.attributes.participation_method)
  ).length;
  const shouldShowWarning = currentSharesForm && sharingPhasesCount > 1;

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

export default FormInputEditButtonWithWarningModal;
