import React from 'react';

import { Box, Label, Text, Spinner } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublicationsByIds from 'api/admin_publications/useAdminPublicationsByIds';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../../_shared/TitleMultilocInput';
import messages from '../messages';

import AdminPublicationSearchInput from './AdminPublicationSearchInput';
import AdminPublicationsList from './AdminPublicationsList';
import { LoadMore, getNewIdsOnDrop, isAdminPublication } from './utils';

const Settings = () => {
  const {
    actions: { setProp },
    adminPublicationIds,
  } = useNode((node) => ({
    adminPublicationIds: node.data.props.adminPublicationIds,
  }));

  const { data: selectedAdminPublications, isFetching } =
    useAdminPublicationsByIds(
      {
        ids: adminPublicationIds,
      },
      // We don't make this request if adminPublicationIds is an empty array.
      { enabled: adminPublicationIds.length > 0 }
    );

  const selectedAdminPublicationsFlat =
    adminPublicationIds.length > 0
      ? selectedAdminPublications?.pages.flatMap((page) => page.data) ?? []
      : [];

  // We derive the ids from the BE response.
  // This basically filters out any admin publication ids corresponding to
  // admin publications that have been deleted.
  const selectedAdminPublicationsIds = isFetching
    ? undefined
    : selectedAdminPublicationsFlat.map(
        (adminPublication) => adminPublication.id
      );

  const handleAdd = (adminPublication?: IAdminPublicationData | LoadMore) => {
    if (!adminPublication) return;
    if (!selectedAdminPublicationsIds) return;
    if (!isAdminPublication(adminPublication)) return;

    setProp((props) => {
      props.adminPublicationIds = [
        ...selectedAdminPublicationsIds,
        adminPublication.id,
      ];
    });
  };

  const handleReorder = (draggedItemId: string, targetIndex: number) => {
    if (!selectedAdminPublicationsIds) return;

    setProp((props) => {
      props.adminPublicationIds = getNewIdsOnDrop(
        selectedAdminPublicationsIds,
        draggedItemId,
        targetIndex
      );
    });
  };

  const handleDelete = (deletedId: string) => {
    if (!selectedAdminPublicationsIds) return;

    setProp((props) => {
      props.adminPublicationIds = selectedAdminPublicationsIds.filter(
        (adminPublicationId) => adminPublicationId !== deletedId
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
          adminPublicationIds={selectedAdminPublicationsIds}
          onChange={handleAdd}
        />
      </Box>
      {isFetching ? (
        <Spinner />
      ) : (
        <AdminPublicationsList
          adminPublications={selectedAdminPublicationsFlat}
          onReorder={handleReorder}
          onDelete={handleDelete}
        />
      )}
    </Box>
  );
};

export default Settings;
