import React, { useState } from 'react';

import { Box, Button, bo, colors } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import usePhase from 'api/phases/usePhase';

import { getPermissionActionSectionSubtitle } from 'containers/Admin/projects/project/permissions/Phase/ActionForms/utils';

import { requiresAccount } from 'components/admin/ActionForm/logic';
import actionFormMessages from 'components/admin/ActionForm/messages';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import PhaseActionForm from './PhaseActionForm';

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
        buttonStyle="bo-text"
        padding="0"
        height="auto"
        width="auto"
        fontSize={`${bo.controlFontSize}px`}
        fontWeight="400"
        textColor={colors.coolGrey500}
        textHoverColor={bo.colors.textHeadingStrong}
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
          <PhaseActionForm phaseId={phaseId} action={action} variant="plain" />
        </Box>
      </Modal>
    </>
  );
};

export default PhaseActionAccess;
