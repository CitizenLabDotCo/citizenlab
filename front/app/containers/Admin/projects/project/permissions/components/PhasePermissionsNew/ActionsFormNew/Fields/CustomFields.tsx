import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

interface Props {
  phaseId: string;
  projectId: string;
}

const CustomFields = ({ phaseId, projectId }: Props) => {
  const { data: permissionFields } = usePermissionsFields({
    phaseId,
    projectId,
    action: 'posting_idea',
  });

  console.log(permissionFields);

  if (phaseId !== 'kut') return null;

  return (
    <SortableList
      items={permissionFields?.data ?? ([] as any)}
      onReorder={() => {}}
    >
      {({ itemsList, handleDragRow, handleDropRow }) => (
        <>
          {itemsList.map((_, index: number) => (
            <SortableRow
              id={index.toString()}
              key={index.toString()}
              index={index}
              moveRow={handleDragRow}
              dropRow={handleDropRow}
              isLastItem={index === itemsList.length - 1}
            >
              <Box
                display="flex"
                flexWrap="wrap"
                alignItems="center"
                marginRight="20px"
              >
                TEST
              </Box>
            </SortableRow>
          ))}
        </>
      )}
    </SortableList>
  );
};

export default CustomFields;
