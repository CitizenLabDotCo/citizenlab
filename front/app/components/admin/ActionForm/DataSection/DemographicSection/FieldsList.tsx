// The reorderable list of demographic questions. Verification-locked fields are
// returned first by the backend and cannot be dragged, so they are kept pinned
// to the top via `lockFirstNItems` and the sortable area only covers the rest.

import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { Action } from 'api/permissions/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import useReorderPermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useReorderPermissionsPhaseCustomField';

import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';

import DemographicRow from './DemographicRow';

const verificationLockedCount = (fields: IPermissionsPhaseCustomFieldData[]) =>
  fields.filter(({ attributes }) => attributes.lock === 'verification').length;

interface Props {
  customFields: IPermissionsPhaseCustomFieldData[];
  phaseId?: string;
  action: Action;
  onChangeRequired: (
    field: IPermissionsPhaseCustomFieldData,
    required: boolean
  ) => void;
  onRemove: (field: IPermissionsPhaseCustomFieldData) => void;
}

const FieldsList = ({
  customFields,
  phaseId,
  action,
  onChangeRequired,
  onRemove,
}: Props) => {
  const { mutate: reorderField } = useReorderPermissionsPhaseCustomField({
    phaseId,
    action,
  });

  const lockedCount = verificationLockedCount(customFields);

  // Every field is verification-locked (or there are none): nothing editable to show.
  if (customFields.length === lockedCount) {
    return (
      <Text as="p" mt="0" mb="8px" fontSize="s" color="coolGrey500">
        No demographic questions asked.
      </Text>
    );
  }

  const handleReorder = (fieldId: string, ordering: number) => {
    const field = customFields.find((f) => f.id === fieldId);
    if (!field) return;

    // Like the required/remove handlers: an unpersisted field is still "fake"
    // and needs its permission + custom-field ids so the backend can create the
    // real, persisted field on this first edit.
    reorderField(
      field.attributes.persisted
        ? { id: fieldId, ordering }
        : {
          id: fieldId,
          permission_id: field.relationships.permission.data.id,
          custom_field_id: field.relationships.custom_field.data.id,
          ordering,
        }
    );
  };

  return (
    <SortableList
      items={customFields}
      lockFirstNItems={lockedCount}
      onReorder={handleReorder}
    >
      {({ itemsList, handleDragRow, handleDropRow }) => (
        <>
          {(itemsList as any).map(
            (field: IPermissionsPhaseCustomFieldData, index: number) => (
              <SortableRow
                key={field.id}
                id={field.id}
                index={index}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
                isLastItem={index === itemsList.length - 1}
                disableNestedStyles
              >
                <Box ml="12px" w="100%">
                  <DemographicRow
                    field={field}
                    onChangeRequired={(required) =>
                      onChangeRequired(field, required)
                    }
                    onRemove={() => onRemove(field)}
                  />
                </Box>
              </SortableRow>
            )
          )}
        </>
      )}
    </SortableList>
  );
};

export default FieldsList;
