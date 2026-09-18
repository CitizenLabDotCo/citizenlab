import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import useInheritPhasePermission from 'api/phase_permissions/useInheritPhasePermission';
import useOverridePhasePermission from 'api/phase_permissions/useOverridePhasePermission';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import usePhase from 'api/phases/usePhase';

import { getPermissionActionSectionSubtitle } from 'containers/Admin/projects/project/permissions/Phase/ActionForms/utils';

import ActionForm from 'components/admin/ActionForm';
import { requiresAccount } from 'components/admin/ActionForm/logic';
import actionFormMessages from 'components/admin/ActionForm/messages';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

const PhaseActionAccess = ({ phaseId, action }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { data: phase } = usePhase(phaseId);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutateAsync: updatePhasePermission } = useUpdatePhasePermission();
  const { mutateAsync: overridePhasePermission } = useOverridePhasePermission();
  const { mutateAsync: inheritPhasePermission } = useInheritPhasePermission();

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
        buttonStyle="text"
        size="s"
        px="0"
        py="0"
        justify="left"
        icon="chevron-right"
        iconPos="right"
        iconSize="16px"
        onClick={() => setOpened(true)}
      >
        {formatMessage(summary())}
      </Button>

      <Modal
        opened={opened}
        close={() => setOpened(false)}
        header={title}
        width="700px"
      >
        <Box p="24px">
          <ActionForm
            phaseId={phaseId}
            permissionData={permission}
            title={title}
            variant="plain"
            onChange={async (changes) => {
              await updatePhasePermission({
                permissionId: permission.id,
                phaseId,
                action,
                permission: changes,
              });
            }}
            onOverride={async () => {
              await overridePhasePermission({ phaseId, action });
            }}
            onRevertToDefaults={async () => {
              await inheritPhasePermission({ phaseId, action });
            }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default PhaseActionAccess;
