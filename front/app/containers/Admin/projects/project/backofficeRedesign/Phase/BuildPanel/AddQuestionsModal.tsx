import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';

import DemographicSection from 'components/admin/ActionForm/DataSection/DemographicSection';
import PersonalInfoSection from 'components/admin/ActionForm/DataSection/PersonalInfoSection';
import { Changes } from 'components/admin/ActionForm/types';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  projectId: string;
  phaseId: string;
  survey: boolean;
  opened: boolean;
  onClose: () => void;
}

// These settings belong to the submission permission, so its access modal
// shows them too.
const AddQuestionsModal = ({
  projectId,
  phaseId,
  survey,
  opened,
  onClose,
}: Props) => {
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
          <ButtonWithLink
            buttonStyle="admin-dark"
            to={
              survey
                ? '/admin/projects/$projectId/phases/$phaseId/survey-form/edit'
                : '/admin/projects/$projectId/phases/$phaseId/form/edit'
            }
            params={{ projectId, phaseId }}
            onClick={onClose}
          >
            {formatMessage(messages.continueToTheForm)}
          </ButtonWithLink>
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
