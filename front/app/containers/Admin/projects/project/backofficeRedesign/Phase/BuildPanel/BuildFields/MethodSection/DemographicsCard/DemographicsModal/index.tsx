import React, { useState } from 'react';

import Modal from 'design-system/Modal';
import Tabs, { TabPanel } from 'design-system/Tabs';

import { IPhasePermissionAction } from 'api/permissions/types';

import PhaseActionForm from 'containers/Admin/projects/_shared/components/PhaseActionForm';

import { useIntl } from 'utils/cl-intl';

import demographicsCardMessages from '../messages';

import ActionTabs from './ActionTabs';
import styles from './DemographicsModal.module.css';
import messages from './messages';

interface Props {
  phaseId: string;
  actions: IPhasePermissionAction[];
  opened: boolean;
  onClose: () => void;
}

const DemographicsModal = ({ phaseId, actions, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const [picked, setPicked] = useState<IPhasePermissionAction>();
  const selected = picked && actions.includes(picked) ? picked : actions[0];
  const title = formatMessage(demographicsCardMessages.collectDemographicData);

  const form = (
    <PhaseActionForm
      // A new action starts from its own saved permission.
      key={selected}
      phaseId={phaseId}
      action={selected}
      variant="data"
    />
  );

  return (
    <Modal
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size={866}
      title={title}
    >
      <div className={styles.body}>
        <p className={styles.helper}>
          {formatMessage(messages.collectDemographicDataDescription)}
        </p>
        {actions.length > 1 ? (
          <Tabs
            selectedKey={selected}
            onSelectionChange={(key) => {
              const action = actions.find((action) => action === key);
              if (action) setPicked(action);
            }}
          >
            <ActionTabs actions={actions} aria-label={title} />
            <TabPanel id={selected}>{form}</TabPanel>
          </Tabs>
        ) : (
          form
        )}
      </div>
    </Modal>
  );
};

export default DemographicsModal;
