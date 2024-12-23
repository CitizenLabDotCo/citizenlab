import React from 'react';

import {
  Box,
  IconButton,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';

import useLocalize from 'hooks/useLocalize';

import { SortableRow, SortableList } from 'components/admin/ResourceList';

const StyledSortableRow = styled(SortableRow)`
  .e2e-admin-list-row {
    padding: 0px !important;
  }

  .e2e-admin-list-row p {
    margin-top: 0;
    margin-bottom: 0;
  }
`;

interface Props {
  adminPublications: IAdminPublicationData[];
  onReorder: (draggedItemId: string, targetIndex: number) => void;
  onDelete: (id: string) => void;
}

const AdminPublicationsList = ({
  adminPublications,
  onReorder,
  onDelete,
}: Props) => {
  const localize = useLocalize();

  return (
    <SortableList
      items={adminPublications}
      onReorder={onReorder}
      key={adminPublications.length}
    >
      {({ itemsList, handleDragRow, handleDropRow }) => (
        <>
          {itemsList.map((item: IAdminPublicationData, index) => (
            <StyledSortableRow
              key={item.id}
              id={item.id}
              index={index}
              moveRow={handleDragRow}
              dropRow={handleDropRow}
              disableNestedStyles
            >
              <Box
                w="100%"
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" alignItems="center">
                  {item.relationships.publication.data.type === 'folder' && (
                    <Icon name="folder-outline" mt="-1px" mb="0" ml="8px" />
                  )}
                  <Text m="0" ml="8px">
                    {localize(item.attributes.publication_title_multiloc)}
                  </Text>
                </Box>
                <IconButton
                  iconName="close"
                  onClick={() => onDelete(item.id)}
                  iconColor={colors.textSecondary}
                  iconColorOnHover={colors.black}
                  a11y_buttonActionMessage=""
                />
              </Box>
            </StyledSortableRow>
          ))}
        </>
      )}
    </SortableList>
  );
};

export default AdminPublicationsList;
