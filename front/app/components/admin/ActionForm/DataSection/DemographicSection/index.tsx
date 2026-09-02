// "Demographic questions": which questions are asked (the platform-wide ones,
// none, or a list curated here), where they are asked (registration flow vs. an
// extra form page), and the reorderable list itself. Owns the permission
// custom-field hooks since they are only used here.

import React, { useState } from 'react';

import {
  Box,
  Text,
  Button,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import useAddPermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useAddPermissionsPhaseCustomField';
import useDeletePermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useDeletePermissionsPhaseCustomField';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';
import useUpdatePermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useUpdatePermissionsPhaseCustomField';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import actionFormMessages from '../../messages';
import { Changes } from '../../types';
import { Expander } from '../../ui';

import DemographicsBehavior from './DemographicsBehavior';
import DemographicsPlacement from './DemographicsPlacement';
import FieldSelectionModal from './FieldSelectionModal';
import FieldsList from './FieldsList';
import messages from './messages';

interface Props {
  permission: IPermissionData;
  phaseId?: string;
  permissionHasForm: boolean;
  onChange: (changes: Changes) => void;
}

const DemographicSection = ({
  permission,
  phaseId,
  permissionHasForm,
  onChange,
}: Props) => {
  const { attributes } = permission;
  const { action, custom_fields_behavior: customFieldsBehavior } = attributes;
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const { formatMessage } = useIntl();

  // Curating a list of questions per action is the paid part. Using the
  // platform-wide questions, or none at all, is not.
  const customAllowed = useFeatureFlag({
    name: 'permissions_custom_fields',
  });

  const { data: permissionFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });
  const { mutate: addCustomField, isPending: isAddingField } =
    useAddPermissionsPhaseCustomField({ phaseId, action });
  const { mutate: updateCustomField } = useUpdatePermissionsPhaseCustomField({
    phaseId,
    action,
  });
  const { mutate: deleteCustomField } = useDeletePermissionsPhaseCustomField({
    phaseId,
    action,
  });

  if (!permissionFields) return null;

  const customFields = permissionFields.data;

  // A field is only "real" in the DB once persisted; before that the backend
  // needs the permission + custom-field ids to create it on first edit.
  const setRequired = (
    field: IPermissionsPhaseCustomFieldData,
    required: boolean
  ) =>
    updateCustomField(
      field.attributes.persisted
        ? { id: field.id, required }
        : {
            id: field.id,
            permission_id: field.relationships.permission.data.id,
            custom_field_id: field.relationships.custom_field.data.id,
            required,
          }
    );

  const removeField = (field: IPermissionsPhaseCustomFieldData) =>
    deleteCustomField({
      id: field.id,
      permission_id: field.relationships.permission.data.id,
      custom_field_id: field.relationships.custom_field.data.id,
    });

  return (
    <Expander
      icon="user-data"
      title={formatMessage(messages.demographicQuestions)}
      summary={
        customFields.length === 0
          ? formatMessage(messages.none)
          : formatMessage(actionFormMessages.nQuestions, {
              nQuestions: customFields.length,
            })
      }
    >
      <DemographicsBehavior
        customFieldsBehavior={customFieldsBehavior}
        customAllowed={customAllowed}
        onChange={onChange}
      />

      {/* The questions themselves are only editable on 'custom'; the other two
          behaviors do not resolve to the permission's own fields. */}
      {customFieldsBehavior === 'custom' && (
        <>
          <Box mt="8px" mb="20px" borderTop={`1px solid ${colors.divider}`} />
          <Text
            as="p"
            mb="8px"
            fontSize="xs"
            fontWeight="bold"
            color="coolGrey600"
          >
            {formatMessage(messages.questions)}
          </Text>

          <FieldsList
            customFields={customFields}
            phaseId={phaseId}
            action={action}
            onChangeRequired={setRequired}
            onRemove={removeField}
          />

          <Box mt="8px" display="flex">
            <Button
              buttonStyle="secondary-outlined"
              size="s"
              icon="plus-circle"
              onClick={() => setShowSelectionModal(true)}
              fontSize={`${fontSizes.s}px`}
              iconSize={`${fontSizes.s}px`}
              padding="4px 8px"
              width="auto"
            >
              {formatMessage(messages.addDemographicQuestion)}
            </Button>
          </Box>

          {/* The shared modal lets the admin pick an existing global field or
              create a brand-new one. Adding a field creates the matching
              permission custom field on this action. */}
          <FieldSelectionModal
            showSelectionModal={showSelectionModal}
            setShowSelectionModal={setShowSelectionModal}
            selectedFields={customFields}
            handleAddField={(customField) =>
              addCustomField({
                custom_field_id: customField.id,
                required: false,
                phaseId,
                action,
              })
            }
            isLoading={isAddingField}
          />
        </>
      )}
      {/* Asking nothing leaves nothing to place. */}
      {permissionHasForm && customFieldsBehavior !== 'disabled' && (
        <>
          <Box mt="20px" mb="20px" borderTop={`1px solid ${colors.divider}`} />
          <DemographicsPlacement
            user_fields_in_form_descriptor={
              attributes.user_fields_in_form_descriptor
            }
            onChange={onChange}
          />
        </>
      )}
    </Expander>
  );
};

export default DemographicSection;
