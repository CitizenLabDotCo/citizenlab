import React, { useState } from 'react';

import {
  Title,
  Box,
  Button,
  Tooltip,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import { Action } from 'api/permissions/types';
import useAddPermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useAddPermissionsPhaseCustomField';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';
import {
  PermittedBy,
  UserFieldsInFormFrontendDescriptor,
} from 'api/phase_permissions/types';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FieldSelectionModal from './FieldSelectionModal';
import FieldsList from './FieldsList';
import messages from './messages';
import UserFieldsInFormRadio from './UserFieldsInFormRadio';

interface Props {
  phaseId?: string;
  action: Action;
  allowAddingFields: boolean;
  permitted_by: PermittedBy;
  user_fields_in_form_frontend_descriptor?: UserFieldsInFormFrontendDescriptor;
  onChangeUserFieldsInForm?: (value: boolean) => void;
}

const Fields = ({
  phaseId,
  action,
  allowAddingFields,
  user_fields_in_form_frontend_descriptor,
  permitted_by,
  onChangeUserFieldsInForm,
}: Props) => {
  const { formatMessage } = useIntl();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const { data: permissionFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });
  const { data: permissions } = usePhasePermissions({ phaseId });
  const globalCustomFieldsSetting =
    permissions?.data[0].attributes.global_custom_fields;

  // We check if globalCustomFieldsSetting is false to allow users who
  // edited the fields before the feature flag was enforced to still access the functionality
  const isPermissionsCustomFieldsAllowed =
    useFeatureFlag({
      name: 'permissions_custom_fields',
      onlyCheckAllowed: true,
    }) || globalCustomFieldsSetting === false;

  const { mutate: addPermissionsCustomField, isLoading } =
    useAddPermissionsPhaseCustomField({
      phaseId,
      action,
    });

  const selectedCustomFields = permissionFields?.data;

  return (
    <Box maxWidth="844px">
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Title variant="h4" color="primary" mt="0px" mb="0px">
          <FormattedMessage {...messages.demographicQuestions} />
        </Title>
        {allowAddingFields && (
          <Tooltip
            content={formatMessage(
              messages.contactGovSuccessToAccessAddingAQuestion
            )}
            disabled={isPermissionsCustomFieldsAllowed}
          >
            <Box>
              <Button
                buttonStyle="admin-dark"
                icon="plus-circle"
                iconSize={`${fontSizes.s}px`}
                fontSize={`${fontSizes.s}px`}
                padding="4px 8px"
                ml="16px"
                disabled={!isPermissionsCustomFieldsAllowed}
                onClick={(e) => {
                  e.preventDefault();
                  setShowSelectionModal(true);
                }}
              >
                <FormattedMessage {...messages.addAQuestion} />
              </Button>
            </Box>
          </Tooltip>
        )}
      </Box>
      {onChangeUserFieldsInForm && user_fields_in_form_frontend_descriptor && (
        <Box>
          <UserFieldsInFormRadio
            user_fields_in_form_frontend_descriptor={
              user_fields_in_form_frontend_descriptor
            }
            onChange={onChangeUserFieldsInForm}
          />
        </Box>
      )}
      {allowAddingFields && (
        <Box mt="8px">
          <FieldsList
            phaseId={phaseId}
            action={action}
            permitted_by={permitted_by}
            userFieldsInForm={
              user_fields_in_form_frontend_descriptor?.value ?? false
            }
          />
        </Box>
      )}
      {selectedCustomFields && (
        <FieldSelectionModal
          showSelectionModal={showSelectionModal}
          setShowSelectionModal={setShowSelectionModal}
          selectedFields={selectedCustomFields}
          handleAddField={(customField) => {
            addPermissionsCustomField({
              custom_field_id: customField.id,
              required: false,
              phaseId,
              action,
            });
          }}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
};

export default Fields;
