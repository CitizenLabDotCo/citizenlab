// "What we collect": personal info, demographic questions, and how the
// collected data is linked to the submission (anonymity).
//
// The demographic questions are read straight from
// `usePermissionsPhaseCustomFields` and mutated through its sibling hooks. The
// rest of the panel is controlled: it reads `permission` and reports edits
// through `onChange` as granular `Changes`.

import React, { useState } from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Button,
  Toggle,
  Select,
  Radio,
  Error,
  IconButton,
  colors,
} from '@citizenlab/cl2-component-library';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import useAddPermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useAddPermissionsPhaseCustomField';
import useDeletePermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useDeletePermissionsPhaseCustomField';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';
import useUpdatePermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useUpdatePermissionsPhaseCustomField';
import { UserDataCollection } from 'api/phase_permissions/types';

import useLocalize from 'hooks/useLocalize';

import FieldSelectionModal from './FieldSelectionModal';
import {
  DATA_COLLECTION_SUMMARY,
  demographicsSummary,
  piiSummary,
  placementLocked,
} from './logic';
import { Changes, IPhasePermissionData } from './types';
import { SectionHeader, Expander, Hint } from './ui';

const PiiToggle = ({
  icon,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon: IconNames;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) => (
  <Box py="8px">
    <Toggle
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      label={
        <Box ml="8px">
          <Box display="flex" alignItems="center" gap="6px">
            <Icon
              name={icon}
              width="16px"
              height="16px"
              fill={checked ? colors.teal500 : colors.coolGrey500}
            />
            <Text as="span" m="0" fontSize="s" fontWeight="semi-bold" color="primary">
              {title}
            </Text>
          </Box>
          <Text as="span" m="0" fontSize="xs" color="coolGrey600">
            {description}
          </Text>
        </Box>
      }
    />
  </Box>
);

const DemographicRow = ({
  field,
  onChangeRequired,
  onRemove,
}: {
  field: IPermissionsPhaseCustomFieldData;
  onChangeRequired: (required: boolean) => void;
  onRemove: () => void;
}) => {
  const localize = useLocalize();
  const title = localize(field.attributes.title_multiloc);
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="8px"
      py="6px"
      px="10px"
      mb="4px"
      borderRadius="6px"
      bgColor={colors.grey50}
    >
      <Text as="span" m="0" fontSize="s" color="primary">
        {title}
      </Text>
      <Box display="flex" alignItems="center" gap="4px">
        <Box width="130px">
          <Select
            size="small"
            value={field.attributes.required ? 'required' : 'optional'}
            options={[
              { value: 'required', label: 'Required' },
              { value: 'optional', label: 'Optional' },
            ]}
            onChange={(option) => onChangeRequired(option.value === 'required')}
          />
        </Box>
        <IconButton
          iconName="delete"
          onClick={onRemove}
          a11y_buttonActionMessage={`Remove ${title}`}
          iconColor={colors.coolGrey500}
          iconColorOnHover={colors.red500}
          iconWidth="18px"
        />
      </Box>
    </Box>
  );
};

const ANONYMITY_OPTIONS: {
  value: UserDataCollection;
  label: string;
  warning?: string;
}[] = [
  {
    value: 'all_data',
    label: 'Link submissions to the participant’s profile (recommended)',
  },
  {
    value: 'demographics_only',
    label: 'Keep demographics in results, but unlink personal info',
    warning:
      'Personal info will not be stored with submissions and cannot be recovered later.',
  },
  {
    value: 'anonymous',
    label: 'Fully anonymous — unlink personal info and demographics',
    warning:
      'Neither personal info nor demographics will be stored with submissions, and cannot be recovered later.',
  },
];

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
  passwordAvailable: boolean;
  // The password requirement is specific to email/password accounts; SSO-only
  // variants hide it entirely.
  showPassword?: boolean;
  onChange: (changes: Changes) => void;
}

const DataSection = ({
  permission,
  phaseId,
  passwordAvailable,
  showPassword = true,
  onChange,
}: Props) => {
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

  // PII and anonymity need an account; demographics are collected in any mode.
  const showAccountParts = attributes.permitted_by === 'users';
  const lockPlacement = placementLocked(permission);
  const placement = attributes.user_fields_in_form_descriptor.value;

  const activeWarning = ANONYMITY_OPTIONS.find(
    (o) => o.value === attributes.user_data_collection
  )?.warning;

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
    <Box>
      <SectionHeader
        icon="user-data"
        title="What we collect"
        tooltip="Information collected from participants, and how it is stored alongside their submission."
      />

      <Box border={`1px solid ${colors.borderLight}`} borderRadius="8px" px="14px">
        {/* Personal info — only meaningful when there's an account. */}
        {showAccountParts && (
          <Expander
            icon="user-circle"
            title="Personal info"
            summary={piiSummary(permission)}
          >
            <PiiToggle
              icon="user-circle"
              title="Full name"
              description="Ask for first and last name."
              checked={attributes.require_name}
              onChange={() =>
                onChange({ require_name: !attributes.require_name })
              }
            />
            {showPassword && (
              <PiiToggle
                icon="lock"
                title="Password"
                description={
                  passwordAvailable
                    ? 'Require a password on the account.'
                    : 'Requires the “Confirmed email” method to be enabled.'
                }
                checked={attributes.require_password}
                disabled={!passwordAvailable}
                onChange={() =>
                  onChange({ require_password: !attributes.require_password })
                }
              />
            )}
          </Expander>
        )}

        {/* Demographics — available in every mode. */}
        <Box
          borderTop={
            showAccountParts ? `1px solid ${colors.divider}` : undefined
          }
        >
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
                  With “Anyone” there is no sign-in step, so demographics can only
                  be asked on a form page.
                </Hint>
              </Box>
            )}

            <Box mt="12px" mb="8px" borderTop={`1px solid ${colors.divider}`} />

            <Text as="p" mt="0" mb="8px" fontSize="xs" fontWeight="bold" color="coolGrey600">
              Questions
            </Text>
            {customFields.length === 0 && (
              <Text as="p" mt="0" mb="8px" fontSize="s" color="coolGrey500">
                No demographic questions asked.
              </Text>
            )}

            {customFields.map((field) => (
              <DemographicRow
                key={field.id}
                field={field}
                onChangeRequired={(required) => setRequired(field, required)}
                onRemove={() => removeField(field)}
              />
            ))}

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
          </Expander>
        </Box>

        {/* Anonymity / data linking — only with an account to link against. */}
        {showAccountParts && (
        <Box borderTop={`1px solid ${colors.divider}`}>
          <Expander
            icon="shield-checkered"
            title="Anonymity in results"
            summary={DATA_COLLECTION_SUMMARY[attributes.user_data_collection]}
          >
            <Text as="p" mt="0" mb="10px" fontSize="xs" color="coolGrey600">
              Independent of what you ask above: you can collect a name yet still
              keep the submission unlinked from the participant’s profile.
            </Text>
            {ANONYMITY_OPTIONS.map((option) => (
              <Box key={option.value} mb="4px">
                <Radio
                  name="data-collection"
                  value={option.value}
                  currentValue={attributes.user_data_collection}
                  onChange={(value: UserDataCollection) =>
                    onChange({ user_data_collection: value })
                  }
                  label={
                    <Text as="span" m="0" fontSize="s" color="primary">
                      {option.label}
                    </Text>
                  }
                />
              </Box>
            ))}
            {activeWarning && <Error text={activeWarning} />}
          </Expander>
        </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataSection;
