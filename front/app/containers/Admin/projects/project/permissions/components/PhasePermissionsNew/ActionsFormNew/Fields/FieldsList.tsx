import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import { IPermissionsFieldData } from 'api/permissions_fields/types';
import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';
import useReorderPermissionsField from 'api/permissions_fields/useReorderPermissionsField';

import { SortableList, SortableRow, Row } from 'components/admin/ResourceList';

import { DISABLED_COLOR } from './constants';
import CustomField from './CustomField';
import EmailField from './EmailField';
import NameField from './NameField';

interface Props {
  phaseId: string;
  disableEditing: boolean;
  action: IPhasePermissionAction;
}

const FieldsList = ({ phaseId, disableEditing, action }: Props) => {
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
              {lockedItemsList?.map((field: IPermissionsFieldData) => {
                if (field.attributes.field_type === 'email') {
                  return (
                    <EmailField
                      key={field.id}
                      field={field}
                      phaseId={phaseId}
                      action={action}
                      disableEditing={disableEditing}
                    />
                  );
                }

                return (
                  <NameField
                    key={field.id}
                    field={field}
                    phaseId={phaseId}
                    action={action}
                    disableEditing={disableEditing}
                  />
                );
              })}
              {itemsList.map((field: IPermissionsFieldData, index: number) => {
                const fieldMarkup = (
                  <CustomField
                    key={field.id}
                    field={field}
                    phaseId={phaseId}
                    action={action}
                    disableEditing={disableEditing}
                  />
                );

                if (disableEditing) {
                  return (
                    <Row
                      key={field.id}
                      bgColor={DISABLED_COLOR}
                      disableNestedStyles
                    >
                      <Box w="100%" pt="2px" pb="1px">
                        {fieldMarkup}
                      </Box>
                    </Row>
                  );
                }

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
                      {fieldMarkup}
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
