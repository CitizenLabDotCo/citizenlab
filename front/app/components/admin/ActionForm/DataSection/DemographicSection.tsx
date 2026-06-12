// "Demographic questions": where they are asked (registration flow vs. an extra
// form page) and the reorderable list of questions themselves. Owns the
// permission custom-field hooks since they are only used here.

import React, { useState } from 'react';

import { Box, Text, Button, Radio, colors } from '@citizenlab/cl2-component-library';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import useAddPermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useAddPermissionsPhaseCustomField';
import useDeletePermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useDeletePermissionsPhaseCustomField';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';
import useUpdatePermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useUpdatePermissionsPhaseCustomField';

import { demographicsSummary, placementLocked } from '../logic';
import { Changes, IPhasePermissionData } from '../types';
import { Expander, Hint } from '../ui';

import FieldSelectionModal from './FieldSelectionModal';
import FieldsList from './FieldsList';

// Demographics placement is stored as a boolean on the permission:
//  - false => ask in the registration flow, before the user participates;
//  - true  => add a new page to the end of the form itself.
const PLACEMENT_OPTIONS: { value: boolean; label: string }[] = [
  {
    value: false,
    label: 'Ask demographic questions before the user participates',
  },
  {
    value: true,
    label: 'Collect demographics by adding a new page to the end of the form',
  },
];

interface Props {
  permission: IPhasePermissionData;
  phaseId?: string;
  onChange: (changes: Changes) => void;
}

const DemographicSection = ({ permission, phaseId, onChange }: Props) => {
  const { attributes } = permission;
  const { action } = attributes;
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const { data: permissionFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });
  const { mutate: addCustomField, isLoading: isAddingField } =
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

  const lockPlacement = placementLocked(permission);
  const placement = attributes.user_fields_in_form_descriptor.value;
  const setPlacement = (value: boolean) =>
    onChange({ user_fields_in_form: value });

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
      title="Demographic questions"
      summary={demographicsSummary(customFields)}
    >
      {/* Where the questions are asked. */}
      <Text as="p" mt="0" mb="6px" fontSize="xs" fontWeight="bold" color="coolGrey600">
        When to ask
      </Text>
      {PLACEMENT_OPTIONS.map((option) => {
        const disabled = lockPlacement && option.value === false;
        return (
          <Box key={String(option.value)} mb="2px">
            <Radio
              name="demographics-placement"
              value={option.value}
              currentValue={placement}
              disabled={disabled}
              onChange={setPlacement}
              label={
                <Text
                  as="span"
                  m="0"
                  fontSize="s"
                  color={disabled ? 'coolGrey500' : 'primary'}
                >
                  {option.label}
                </Text>
              }
            />
          </Box>
        );
      })}
      {lockPlacement && (
        <Box mb="10px">
          <Hint>
            With “Anyone” there is no sign-in step, so demographics can only be
            asked on a form page.
          </Hint>
        </Box>
      )}

      <Box mt="12px" mb="8px" borderTop={`1px solid ${colors.divider}`} />

      <Text as="p" mt="0" mb="8px" fontSize="xs" fontWeight="bold" color="coolGrey600">
        Questions
      </Text>

      <FieldsList
        customFields={customFields}
        phaseId={phaseId}
        action={action}
        onChangeRequired={setRequired}
        onRemove={removeField}
      />

      <Box mt="8px">
        <Button
          buttonStyle="secondary-outlined"
          size="s"
          icon="plus-circle"
          onClick={() => setShowSelectionModal(true)}
        >
          Add a demographic question
        </Button>
      </Box>

      {/* The shared modal lets the admin pick an existing global field or create
          a brand-new one. Adding a field creates the matching permission custom
          field on this action. */}
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
    </Expander>
  );
};

export default DemographicSection;
