import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
// import { IPermissionsFields } from 'api/permissions_fields/types';
import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

// const separateFields = (fields: IPermissionsFields) => {
// const defaultFields = fields.data.filter((field) => field.attributes.);
// }

const FieldsList = ({ phaseId, action }: Props) => {
  const { data: permissionFields } = usePermissionsFields({
    phaseId,
    action,
  });

  return (
    <>
      <SortableList
        items={permissionFields?.data ?? ([] as any)}
        onReorder={() => {}}
      >
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((_field, index: number) => (
              <SortableRow
                id={index.toString()}
                key={index.toString()}
                index={index}
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
    </>
  );
};

export default FieldsList;
