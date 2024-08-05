import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import { IPermissionsFieldData } from 'api/permissions_fields/types';
import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';
import useReorderPermissionsField from 'api/permissions_fields/useReorderPermissionsField';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

import CustomField from './CustomField';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

const FieldsList = ({ phaseId, action }: Props) => {
  const { data: permissionFields } = usePermissionsFields({
    phaseId,
    action,
  });

  const { mutate: reorderPermissionsField } = useReorderPermissionsField();

  if (permissionFields && permissionFields.data.length === 0) {
    return null;
  }

  return (
    <>
      {permissionFields && (
        <SortableList
          items={permissionFields.data}
          onReorder={(permissionFieldId, newOrder) => {
            const permissionsField = permissionFields.data.find(
              (field) => field.id === permissionFieldId
            );

            if (!permissionsField) return;

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
            if (permissionsField.attributes.persisted) {
              reorderPermissionsField({
                id: permissionFieldId,
                ordering: newOrder,
              });
            } else {
              reorderPermissionsField({
                id: permissionFieldId,
                permission_id:
                  permissionsField.relationships.permission.data.id,
                custom_field_id:
                  permissionsField.relationships.custom_field.data.id,
                ordering: newOrder,
              });
            }
          }}
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            <>
              {itemsList.map((field: IPermissionsFieldData, index: number) => {
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
              })}
            </>
          )}
        </SortableList>
      )}
    </>
  );
};

export default FieldsList;
