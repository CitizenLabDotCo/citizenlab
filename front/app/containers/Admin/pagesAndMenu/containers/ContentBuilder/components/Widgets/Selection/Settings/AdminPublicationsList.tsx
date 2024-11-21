import React from 'react';

import {
  Box,
  IconButton,
  Icon,
  Spinner,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublicationsByIds from 'api/admin_publications/useAdminPublicationsByIds';

import useLocalize from 'hooks/useLocalize';

import { SortableRow, SortableList } from 'components/admin/ResourceList';

const StyledSortableRow = styled(SortableRow)`
  .e2e-admin-list-row {
    padding: 0px !important;
  }

  .e2e-admin-list-row p {
    margin: 0;
  }
`;

interface Props {
  adminPublicationIds: string[];
  onReorder: (draggedItemId: string, targetIndex: number) => void;
  onDelete: (id: string) => void;
}

const AdminPublicationsList = ({
  adminPublicationIds,
  onReorder,
  onDelete,
}: Props) => {
  const localize = useLocalize();

  const { data: selectedAdminPublications, isFetching } =
    useAdminPublicationsByIds(
      {
        ids: adminPublicationIds,
      },
      // We don't make this request if adminPublicationIds is an empty array.
      // If it's an empty array, the FE removes it while parsing the query params
      // for some reason, and the BE will return all admin publications.
      // This is not what we want.
      { enabled: adminPublicationIds.length > 0 }
    );

  const selectedAdminPublicationsFlat =
    adminPublicationIds.length > 0
      ? selectedAdminPublications?.pages.flatMap((page) => page.data) ?? []
      : [];

  return (
    <SortableList
      items={selectedAdminPublicationsFlat}
      onReorder={onReorder}
      key={selectedAdminPublicationsFlat.length}
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
                    <Icon
                      name="folder-outline"
                      mt="-1px"
                      mb="0"
                      mr="8px"
                      ml="-8px"
                    />
                  )}
                  <Text m="0">
                    {localize(item.attributes.publication_title_multiloc)}
                  </Text>
                </Box>
                <IconButton
                  iconName="close"
                  onClick={() => onDelete(item.id)}
                  iconColor={colors.textSecondary}
                  iconColorOnHover="#000"
                  a11y_buttonActionMessage=""
                />
              </Box>
            </StyledSortableRow>
          ))}
          {isFetching && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              p="12px"
            >
              <Spinner />
            </Box>
          )}
        </>
      )}
    </SortableList>
  );
};

export default AdminPublicationsList;
