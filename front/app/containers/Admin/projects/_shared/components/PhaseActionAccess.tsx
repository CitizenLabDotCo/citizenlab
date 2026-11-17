import React, { useState } from 'react';

import Button from 'design-system/Button';
import Modal from 'design-system/Modal';

import { IPhasePermissionAction } from 'api/permissions/types';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import usePhase from 'api/phases/usePhase';

import { getPermissionActionSectionSubtitle } from 'containers/Admin/projects/project/permissions/Phase/ActionForms/utils';

import { requiresAccount } from 'components/admin/ActionForm/logic';
import actionFormMessages from 'components/admin/ActionForm/messages';

import { useIntl } from 'utils/cl-intl';

import PhaseActionForm from './PhaseActionForm';
import 'design-system/tokens.css';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

const PhaseActionAccess = ({ phaseId, action }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { data: phase } = usePhase(phaseId);
  const { data: permissions } = usePhasePermissions({ phaseId });

  const permission = permissions?.data.find(
    (permission) => permission.attributes.action === action
  );

  if (!permission || !phase) return null;

  const title = formatMessage(
    getPermissionActionSectionSubtitle({
      permissionAction: action,
      participationMethod: phase.data.attributes.participation_method,
    })
  );

  const summary = () => {
    if (permission.attributes.permitted_by === 'admins_moderators') {
      return actionFormMessages.adminsManagersOnly;
    }

    return requiresAccount(permission)
      ? actionFormMessages.signInRequired
      : actionFormMessages.anyoneCanParticipate;
  };

  return (
    <>
      <Button
        variant="quiet"
        size={28}
        trailingIcon="chevron-right-16"
        onPress={() => setOpened(true)}
      >
        {formatMessage(summary())}
      </Button>

      <Modal isOpen={opened} onOpenChange={setOpened} title={title} size={560}>
        <PhaseActionForm phaseId={phaseId} action={action} variant="plain" />
      </Modal>
    </>
  );
};

export default PhaseActionAccess;
