import React, { useState } from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublications from 'api/admin_publications/useAdminPublications';

import useLocalize from 'hooks/useLocalize';

import {
  SortableList,
  SortableRow,
  TextCell,
} from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../../_shared/TitleMultilocInput';
import messages from '../messages';

import AdminPublicationSearchInput from './AdminPublicationSearchInput';
import { getNewIdsOnDrop } from './utils';

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

  const handleReorder = (draggedItemId: string, targetIndex: number) => {
    setProp((props) => {
      props.adminPublicationIds = getNewIdsOnDrop(
        adminPublicationIds,
        draggedItemId,
        targetIndex
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
        items={selectedAdminPublicationsFlat}
        onReorder={handleReorder}
        key={selectedAdminPublicationsFlat.length}
      >
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((item: IAdminPublicationData, index) => (
              <SortableRow
                key={item.id}
                id={item.id}
                index={index}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
              >
                <TextCell>
                  <Text>
                    {localize(item.attributes.publication_title_multiloc)}
                  </Text>
                </TextCell>
              </SortableRow>
            ))}
          </>
        )}
      </SortableList>
    </Box>
  );
};

export default Settings;
