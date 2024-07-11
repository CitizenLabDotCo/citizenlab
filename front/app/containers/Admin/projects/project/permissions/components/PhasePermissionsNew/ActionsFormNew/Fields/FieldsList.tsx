import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import {
  IPermissionsFieldData,
  IPermissionsFields,
} from 'api/permissions_fields/types';
import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';
import useReorderPermissionsField from 'api/permissions_fields/useReorderPermissionsField';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';

import useLocalize from 'hooks/useLocalize';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

import DefaultField from './DefaultField';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

const separateFields = (fields?: IPermissionsFields) => {
  if (!fields) return {};

  const emailField = fields.data.find(
    (field) => field.attributes.field_type === 'email'
  );
  const nameField = fields.data.find(
    (field) => field.attributes.field_type === 'name'
  );
  const customFields = fields.data.filter(
    (field) => field.attributes.field_type === 'custom_field'
  );

  return {
    emailField,
    nameField,
    customFields,
  };
};

const FieldsList = ({ phaseId, action }: Props) => {
  const { data: permissionFields } = usePermissionsFields({
    phaseId,
    action,
  });

  const { mutate: reorderPermissionsField } = useReorderPermissionsField();

  const { emailField, nameField, customFields } =
    separateFields(permissionFields);

  return (
    <>
      {emailField && <DefaultField fieldName={'Email'} />}
      {nameField && <DefaultField fieldName={'Name'} />}
      {customFields && (
        <SortableList
          items={customFields}
          onReorder={(fieldId, newOrder) => {
            reorderPermissionsField({ id: fieldId, ordering: newOrder });
          }}
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            <>
              {itemsList.map((field: IPermissionsFieldData, index: number) => (
                <SortableRow
                  id={field.id}
                  key={field.id}
                  index={field.attributes.ordering}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                  isLastItem={index === itemsList.length - 1}
                >
                  <DraggableField field={field} key={field.id} />
                </SortableRow>
              ))}
            </>
          )}
        </SortableList>
      )}
    </>
  );
};

const DraggableField = ({ field }: { field: IPermissionsFieldData }) => {
  const customFieldId = field.relationships.custom_field.data?.id;
  const { data: customField } = useUserCustomField(customFieldId);
  const localize = useLocalize();

  return (
    <Box w="100%" display="flex" alignItems="center" marginRight="20px">
      <Text m="0" mt="4px" fontSize="m" color="primary">
        {localize(customField?.data.attributes.title_multiloc)}
      </Text>
    </Box>
  );
};

export default FieldsList;
