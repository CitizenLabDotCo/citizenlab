import React from 'react';

import { IPhasePermissionAction } from 'api/permissions/types';
import { IPermissionsFieldData } from 'api/permissions_fields/types';
import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';
import useReorderPermissionsField from 'api/permissions_fields/useReorderPermissionsField';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

import CustomField from './CustomField';
import DefaultField from './DefaultField';

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

  return (
    <>
      {permissionFields && (
        <SortableList
          items={permissionFields.data}
          lockFirstNItems={2}
          onReorder={(fieldId, newOrder) => {
            reorderPermissionsField({ id: fieldId, ordering: newOrder });
          }}
        >
          {({ lockedItemsList, itemsList, handleDragRow, handleDropRow }) => (
            <>
              {lockedItemsList?.map((field: IPermissionsFieldData) => (
                <DefaultField
                  key={field.id}
                  field={field}
                  phaseId={phaseId}
                  action={action}
                />
              ))}
              {itemsList.map((field: IPermissionsFieldData, index: number) => {
                return (
                  <SortableRow
                    key={field.id}
                    id={field.id}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    isLastItem={index === itemsList.length - 1}
                  >
                    <CustomField
                      key={field.id}
                      field={field}
                      phaseId={phaseId}
                      action={action}
                    />
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
