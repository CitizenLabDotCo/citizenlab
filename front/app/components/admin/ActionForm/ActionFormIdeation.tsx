import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';
import { isPhasePermission } from 'api/phase_permissions/utils';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AccessRestrictions from '../ActionForm/AccessRestrictions';
import Fields from '../ActionForm/Fields';
import FlowVisualization from '../ActionForm/FlowVisualization';
import ResetButton from '../ActionForm/ResetButton';
import { allowAddingFields, showResetButton } from '../ActionForm/utils';

import { Props } from './types';

const ActionFormIdeation = ({
  phaseId,
  permissionData,
  onChange,
  onReset,
}: Props) => {
  const { data: phase } = usePhase(phaseId);

  const { data: permissionsCustomFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action: permissionData.attributes.action,
  });

  const ideationAccountlessPostingEnabled = useFeatureFlag({
    name: 'ideation_accountless_posting',
  });

  if (!isPhasePermission(permissionData)) {
    return null;
  }

  const {
    attributes: {
      permitted_by,
      action,
      verification_enabled,
      verification_expiry,
      user_fields_in_form_frontend_descriptor,
    },
    relationships,
  } = permissionData;

  const groupIds = relationships.groups.data.map((p) => p.id);

  if (!permissionsCustomFields) return null;
  if (!phase) return null;

  const userFieldsInForm = user_fields_in_form_frontend_descriptor.value;
  const { explanation } = user_fields_in_form_frontend_descriptor;

  return (
    <form className={`e2e-action-form-${action}`}>
      <AccessRestrictions
        showAnyone={ideationAccountlessPostingEnabled}
        permissionData={permissionData}
        onChange={onChange}
      />
      {permitted_by !== 'admins_moderators' && (
        <>
          <Box mt="20px">
            <Fields
              phaseId={phaseId}
              action={action}
              allowAddingFields={allowAddingFields(explanation)}
              user_fields_in_form_frontend_descriptor={
                user_fields_in_form_frontend_descriptor
              }
              permitted_by={permitted_by}
              onChangeUserFieldsInForm={(user_fields_in_form) => {
                onChange({ user_fields_in_form });
              }}
            />
          </Box>
          <Box mt="20px">
            <FlowVisualization
              permittedBy={permitted_by}
              verificationEnabled={verification_enabled}
              verificationExpiry={verification_expiry}
              permissionsCustomFields={permissionsCustomFields.data}
              onChangeVerificationExpiry={(verification_expiry) => {
                onChange({ verification_expiry });
              }}
              userFieldsInForm={userFieldsInForm}
            />
          </Box>
          {showResetButton(
            permitted_by,
            permissionsCustomFields.data,
            groupIds
          ) && <ResetButton onClick={onReset} />}
        </>
      )}
    </form>
  );
};

export default ActionFormIdeation;
