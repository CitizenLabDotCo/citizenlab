import React from 'react';

import { Box, Button, Spinner } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';

import DemographicSection from 'components/admin/ActionForm/DataSection/DemographicSection';
import PersonalInfoSection from 'components/admin/ActionForm/DataSection/PersonalInfoSection';
import { Changes } from 'components/admin/ActionForm/types';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  phaseId: string;
  opened: boolean;
  onClose: () => void;
  onContinue: () => void;
}

// What participants are asked for besides the form itself, on the way to the
// form builder. The settings belong to the submission permission, so its access
// modal shows them too.
const AddQuestionsModal = ({ phaseId, opened, onClose, onContinue }: Props) => {
  const { formatMessage } = useIntl();
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutate: updatePhasePermission } = useUpdatePhasePermission();

  const permission = permissions?.data.find(
    ({ attributes }) => attributes.action === 'posting_idea'
  );

  const handleChange = (changes: Changes) => {
    if (!permission) return;

    updatePhasePermission({
      permissionId: permission.id,
      phaseId,
      action: 'posting_idea',
      permission: changes,
    });
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={720}
      header={formatMessage(messages.informationCollected)}
      footer={
        <Box display="flex" justifyContent="flex-end" width="100%">
          <Button buttonStyle="admin-dark" onClick={onContinue}>
            {formatMessage(messages.continueToTheForm)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        {permission ? (
          <>
            {permission.attributes.permitted_by === 'users' && (
              <PersonalInfoSection
                permission={permission}
                defaultOpen
                onChange={handleChange}
              />
            )}
            <DemographicSection
              permission={permission}
              phaseId={phaseId}
              permissionHasForm
              defaultOpen
              onChange={handleChange}
            />
          </>
        ) : (
          <Spinner />
        )}
      </Box>
    </Modal>
  );
};

export default AddQuestionsModal;
