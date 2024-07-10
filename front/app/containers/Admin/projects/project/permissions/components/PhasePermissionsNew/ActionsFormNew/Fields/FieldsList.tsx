import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import {
  IPermissionsFieldData,
  IPermissionsFields,
} from 'api/permissions_fields/types';
import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';

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

  const { emailField, nameField, customFields } =
    separateFields(permissionFields);

  return (
    <>
      {emailField && <DefaultField fieldName={'Email'} />}
      {nameField && <DefaultField fieldName={'Name'} />}
      {customFields && (
        <SortableList items={customFields} onReorder={() => {}}>
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
                  <Box
                    w="100%"
                    display="flex"
                    alignItems="center"
                    marginRight="20px"
                  >
                    <Text m="0" mt="4px" fontSize="m" color="primary">
                      Test
                    </Text>
                  </Box>
                </SortableRow>
              ))}
            </>
          )}
        </SortableList>
      )}
    </>
  );
};

export default FieldsList;
