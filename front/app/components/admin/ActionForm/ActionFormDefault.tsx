import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';

import AccessRestrictions from './AccessRestrictions';
import Fields from './Fields';
import FlowVisualization from './FlowVisualization';
import ResetButton from './ResetButton';
import { Props } from './types';
import { showResetButton } from './utils';

const ActionFormDefault = ({
  phaseId,
  permissionData,
  onChange,
  onReset,
}: Props) => {
  const {
    attributes: {
      permitted_by,
      action,
      verification_enabled,
      verification_expiry,
    },
    relationships,
  } = permissionData;

  const groupIds = relationships.groups.data.map((p) => p.id);

  const { data: permissionsCustomFields } = usePermissionsCustomFields({
    phaseId,
    action,
  });

  if (!permissionsCustomFields) return null;

  return (
    <form className={`e2e-action-form-${action}`}>
      <AccessRestrictions permissionData={permissionData} onChange={onChange} />
      {permitted_by !== 'admins_moderators' && (
        <>
          <Box mt="24px">
            <Fields
              phaseId={phaseId}
              action={action}
              showAddQuestion={permitted_by !== 'everyone'}
              userFieldsInForm={false}
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
              userFieldsInForm={false}
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

export default ActionFormDefault;
