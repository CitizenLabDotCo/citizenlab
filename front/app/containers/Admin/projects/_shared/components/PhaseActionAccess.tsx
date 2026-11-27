import React, { useState } from 'react';

import Banner from 'design-system/Banner';
import Button from 'design-system/Button';
import Modal from 'design-system/Modal';

import { IPhasePermissionAction } from 'api/permissions/types';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import usePhase from 'api/phases/usePhase';

import { getPermissionActionSectionSubtitle } from 'containers/Admin/projects/project/permissions/Phase/ActionForms/utils';

import { requiresAccount } from 'components/admin/ActionForm/logic';
import actionFormMessages from 'components/admin/ActionForm/messages';
import { Changes } from 'components/admin/ActionForm/types';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from './messages';
import PhaseActionForm from './PhaseActionForm';
import 'design-system/tokens.css';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

const PhaseActionAccess = ({ phaseId, action }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const [staged, setStaged] = useState<Changes>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const { data: phase } = usePhase(phaseId);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutateAsync: updatePhasePermission } = useUpdatePhasePermission();

  const permission = permissions?.data.find(
    (permission) => permission.attributes.action === action
  );

  if (!permission || !phase) return null;

  const participationMethod = phase.data.attributes.participation_method;
  const title = formatMessage(
    getPermissionActionSectionSubtitle({
      permissionAction: action,
      participationMethod,
    })
  );
  // A phase with an input form has its own Collect demographic data card.
  const formEditor = getMethodConfig(participationMethod).formEditor;
  const hasDemographicsCard =
    formEditor !== null && formEditor !== 'surveyEditor';

  const summary = () => {
    if (permission.attributes.permitted_by === 'admins_moderators') {
      return actionFormMessages.adminsManagersOnly;
    }

    return requiresAccount(permission)
      ? actionFormMessages.signInRequired
      : actionFormMessages.anyoneCanParticipate;
  };

  const close = () => {
    setStaged({});
    setFailed(false);
    setOpened(false);
  };

  const save = async () => {
    setSaving(true);
    setFailed(false);
    try {
      if (Object.keys(staged).length > 0) {
        await updatePhasePermission({
          permissionId: permission.id,
          phaseId,
          action,
          permission: staged,
        });
      }
      close();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
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

      <Modal
        isOpen={opened}
        onOpenChange={(isOpen) => {
          if (!isOpen) close();
        }}
        title={title}
        size={866}
        primaryAction={{
          label: formatMessage(messages.saveChanges),
          isPending: saving,
          isDisabled: Object.keys(staged).length === 0,
          onPress: save,
        }}
      >
        {failed && (
          <Banner tone="error">{formatMessage(messages.saveFailed)}</Banner>
        )}
        <PhaseActionForm
          phaseId={phaseId}
          action={action}
          variant="plain"
          showData={!hasDemographicsCard}
          staged={staged}
          onStage={(changes) =>
            setStaged((current) => ({ ...current, ...changes }))
          }
        />
      </Modal>
    </>
  );
};

export default PhaseActionAccess;
