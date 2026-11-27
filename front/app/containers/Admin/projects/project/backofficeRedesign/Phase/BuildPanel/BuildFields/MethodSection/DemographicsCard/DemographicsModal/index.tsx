import React, { useState } from 'react';

import Banner from 'design-system/Banner';
import Divider from 'design-system/Divider';
import Modal from 'design-system/Modal';
import SegmentedTabs, {
  SegmentedTab,
  SegmentedTabList,
} from 'design-system/SegmentedTabs';
import Text from 'design-system/Text';

import { IPermissionData, IPhasePermissionAction } from 'api/permissions/types';
import useOverridePhasePermission from 'api/phase_permissions/useOverridePhasePermission';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';

import { Changes } from 'components/admin/ActionForm/types';

import { useIntl } from 'utils/cl-intl';

import demographicsCardMessages from '../messages';

import DemographicsForm from './DemographicsForm';
import styles from './DemographicsModal.module.css';
import messages from './messages';
import shortActionLabel from './shortActionLabel';

interface Props {
  phaseId: string;
  actions: IPhasePermissionAction[];
  opened: boolean;
  onClose: () => void;
}

type Staged = Partial<Record<IPhasePermissionAction, Changes>>;

const DemographicsModal = ({ phaseId, actions, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const [picked, setPicked] = useState<IPhasePermissionAction>();
  const [staged, setStaged] = useState<Staged>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutateAsync: overridePermission } = useOverridePhasePermission();
  const { mutateAsync: updatePermission } = useUpdatePhasePermission();

  const selected = picked && actions.includes(picked) ? picked : actions[0];
  const title = formatMessage(demographicsCardMessages.collectDemographicData);
  const permissionOf = (action: IPhasePermissionAction) =>
    permissions?.data.find(({ attributes }) => attributes.action === action);
  const permission = permissionOf(selected);
  const hasChanges = Object.values(staged).some(
    (changes) => Object.keys(changes).length > 0
  );

  // A permission that follows the platform defaults is saved as its own copy
  // first; only that copy can change.
  const ensureOverridden = async (
    action: IPhasePermissionAction
  ): Promise<IPermissionData> => {
    const current = permissionOf(action);
    if (current && !current.attributes.inherited) return current;
    const { data } = await overridePermission({ phaseId, action });
    return data;
  };

  const close = () => {
    setStaged({});
    setFailed(false);
    onClose();
  };

  const save = async () => {
    setSaving(true);
    setFailed(false);
    try {
      for (const action of actions) {
        const changes = staged[action];
        if (!changes || Object.keys(changes).length === 0) continue;
        const saved = await ensureOverridden(action);
        await updatePermission({
          permissionId: saved.id,
          phaseId,
          action,
          permission: changes,
        });
      }
      close();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const form = permission && (
    <DemographicsForm
      // A new action starts from its own saved permission.
      key={selected}
      phaseId={phaseId}
      permission={permission}
      staged={staged[selected] ?? {}}
      onStage={(changes) =>
        setStaged((current) => ({
          ...current,
          [selected]: { ...current[selected], ...changes },
        }))
      }
      ensureOverridden={() => ensureOverridden(selected)}
    />
  );

  return (
    <Modal
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) close();
      }}
      size={560}
      title={title}
      primaryAction={{
        label: formatMessage(messages.save),
        isPending: saving,
        onPress: save,
      }}
      // Cancel shows once there is something to throw away.
      secondaryAction={
        hasChanges
          ? { label: formatMessage(messages.cancel), isDisabled: saving }
          : undefined
      }
    >
      <div className={styles.body}>
        <Text variant="ui" tone="secondary">
          {formatMessage(messages.collectDemographicDataDescription)}
        </Text>
        {actions.length > 1 && (
          <SegmentedTabs
            selectedKey={selected}
            onSelectionChange={(key) => {
              const action = actions.find((action) => action === key);
              if (action) setPicked(action);
            }}
          >
            <SegmentedTabList aria-label={title}>
              {actions.map((action) => (
                <SegmentedTab key={action} id={action}>
                  {formatMessage(shortActionLabel(action))}
                </SegmentedTab>
              ))}
            </SegmentedTabList>
          </SegmentedTabs>
        )}
        <Divider />
        {failed && (
          <Banner tone="error">{formatMessage(messages.saveFailed)}</Banner>
        )}
        {form}
      </div>
    </Modal>
  );
};

export default DemographicsModal;
