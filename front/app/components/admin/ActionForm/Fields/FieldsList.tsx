import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { Action } from 'api/permissions/types';
import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import useReorderPermissionsCustomField from 'api/permissions_custom_fields/useReorderPermissionsCustomField';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

import CustomField from './CustomField';

interface Props {
  phaseId?: string;
  action: Action;
}

const FieldsList = ({ phaseId, action }: Props) => {
  const { data: permissionFields } = usePermissionsCustomFields({
    phaseId,
    action,
  });

  const { mutate: reorderPermissionsCustomField } =
    useReorderPermissionsCustomField();

  if (permissionFields && permissionFields.data.length === 0) {
    return null;
  }

  return (
    <>
      {permissionFields && (
        <SortableList
          items={permissionFields.data}
          onReorder={(permissionFieldId, newOrder) => {
            const permissionsCustomField = permissionFields.data.find(
              (field) => field.id === permissionFieldId
            );

            if (!permissionsCustomField) return;

            // This 'persisted' attribute is used to determine whether
            // this field is 'real' and actually exists in our database.
            // By default, we get back a bunch of 'fake' fields from the API,
            // and only when we edit something for the first time will
            // we get the 'real' persisted ones.
            //
            // So on the first edit, when persisted is still false,
            // we also need to send the permission_id
            // and the custom_field_id, so that the backend can create
            // the 'real' persisted field.
            if (permissionsCustomField.attributes.persisted) {
              reorderPermissionsCustomField({
                id: permissionFieldId,
                ordering: newOrder,
              });
            } else {
              reorderPermissionsCustomField({
                id: permissionFieldId,
                permission_id:
                  permissionsCustomField.relationships.permission.data.id,
                custom_field_id:
                  permissionsCustomField.relationships.custom_field.data.id,
                ordering: newOrder,
              });
            }
          }}
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            <>
              {itemsList.map(
                (field: IPermissionsCustomFieldData, index: number) => {
                  return (
                    <SortableRow
                      key={field.id}
                      id={field.id}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                      isLastItem={index === itemsList.length - 1}
                      disableNestedStyles
                    >
                      <Box ml="20px" w="100%">
                        <CustomField
                          key={field.id}
                          field={field}
                          phaseId={phaseId}
                          action={action}
                        />
                      </Box>
                    </SortableRow>
                  );
                }
              )}
            </>
          )}
        </SortableList>
      )}
    </>
  );
};

export default FieldsList;
