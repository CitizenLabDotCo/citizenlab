import React from 'react';

import { Box, Button, fontSizes } from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';

import { FormattedMessage } from 'utils/cl-intl';

import AccessRestrictions from './AccessRestrictions';
import Fields from './Fields';
import FlowVisualization from './FlowVisualization';
import messages from './messages';
import { Changes } from './types';
import { showResetButton } from './utils';

interface Props {
  phaseId?: string;
  permissionData: IPermissionData;
  onChange: (changes: Changes) => Promise<void>;
  onReset: () => void;
}

const ActionForm = ({ phaseId, permissionData, onChange, onReset }: Props) => {
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
          ) && (
            <Box mt="28px" w="100%" display="flex">
              <Button
                width="auto"
                buttonStyle="text"
                onClick={onReset}
                padding="0px"
                fontSize={`${fontSizes.m}px`}
              >
                <span style={{ textDecorationLine: 'underline' }}>
                  <FormattedMessage
                    {...messages.resetDemographicQuestionsAndGroups}
                  />
                </span>
              </Button>
            </Box>
          )}
        </>
      )}
    </form>
  );
};

export default ActionForm;
