import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Label,
  Icon,
  Spinner,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../../_shared/TitleMultilocInput';
import messages from '../messages';

import AdminPublicationSearchInput from './AdminPublicationSearchInput';
import { getNewIdsOnDrop, stabilizeOrdering } from './utils';

const StyledSortableRow = styled(SortableRow)`
  .e2e-admin-list-row {
    padding: 0px !important;
  }

  .e2e-admin-list-row p {
    margin: 0;
  }
`;

const Settings = () => {
  const localize = useLocalize();
  const [search, setSearch] = useState('');

  const {
    actions: { setProp },
    adminPublicationIds,
  } = useNode((node) => ({
    adminPublicationIds: node.data.props.adminPublicationIds,
  }));

  const { data: selectedAdminPublications } = useAdminPublications(
    {
      ids: adminPublicationIds,
      pageNumber: 1,
      pageSize: 250,
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

  const { data: adminPublications } = useAdminPublications({
    search,
  });

  const adminPublicationsFlat = adminPublications?.pages.flatMap(
    (page) => page.data
  );

  if (!adminPublicationsFlat) return null;

  const loadingSelectedAdminPubs =
    selectedAdminPublicationsFlat.length < adminPublicationIds.length;

  const handleReorder = (draggedItemId: string, targetIndex: number) => {
    setProp((props) => {
      props.adminPublicationIds = getNewIdsOnDrop(
        adminPublicationIds,
        draggedItemId,
        targetIndex
      );
    });
  };

  const handleDelete = (id: string) => {
    setProp((props) => {
      props.adminPublicationIds = adminPublicationIds.filter(
        (adminPublicationId) => adminPublicationId !== id
      );
    });
  };

  return (
    <Box my="20px">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage {...messages.inThisWidget} formatBold />
      </Text>
      <Box mb="40px">
        <TitleMultilocInput name="selection_title" />
      </Box>
      <Box mb="20px">
        <Label htmlFor="admin-publication-search-input">
          <FormattedMessage {...messages.selectProjectsOrFolders} />
        </Label>
        <AdminPublicationSearchInput
          options={adminPublicationsFlat}
          searchInputValue={search}
          onChange={(adminPublication) => {
            if (!adminPublication) return;
            setProp((props) => {
              props.adminPublicationIds = [
                ...adminPublicationIds,
                adminPublication.id,
              ];
            });
          }}
          onSearchInputChange={setSearch}
        />
      </Box>
      <SortableList
        items={stabilizeOrdering(
          selectedAdminPublicationsFlat,
          adminPublicationIds
        )}
        onReorder={handleReorder}
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
                    onClick={() => handleDelete(item.id)}
                    iconColor={colors.textSecondary}
                    iconColorOnHover="#000"
                    a11y_buttonActionMessage=""
                  />
                </Box>
              </StyledSortableRow>
            ))}
            {loadingSelectedAdminPubs && (
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
    </Box>
  );
};

export default Settings;
