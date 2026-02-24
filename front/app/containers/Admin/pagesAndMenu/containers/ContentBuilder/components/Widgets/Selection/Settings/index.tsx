import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { useParams } from 'utils/router';

import { IAdminPublicationData } from 'api/admin_publications/types';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../../_shared/TitleMultilocInput';
import messages from '../messages';

import AdminPublicationSearchInput from './AdminPublicationSearchInput';
import AdminPublicationsList from './AdminPublicationsList';
import { LoadMore, getNewIdsOnDrop, isAdminPublication } from './utils';

const Settings = () => {
  const { folderId } = useParams({ strict: false }) as {
    folderId: string; // We only return projects from the folder if folderId is defined
  };
  const {
    actions: { setProp },
    adminPublicationIds,
  } = useNode((node) => ({
    adminPublicationIds: node.data.props.adminPublicationIds,
  }));

  const handleAdd = (adminPublication?: IAdminPublicationData | LoadMore) => {
    if (!adminPublication) return;
    if (!isAdminPublication(adminPublication)) return;

    setProp((props) => {
      props.adminPublicationIds = [...adminPublicationIds, adminPublication.id];
    });
  };

  const handleReorder = (draggedItemId: string, targetIndex: number) => {
    setProp((props) => {
      props.adminPublicationIds = getNewIdsOnDrop(
        adminPublicationIds,
        draggedItemId,
        targetIndex
      );
    });
  };

  const handleDelete = (deletedId: string) => {
    if (!adminPublicationIds) return;

    setProp((props) => {
      props.adminPublicationIds = adminPublicationIds.filter(
        (adminPublicationId) => adminPublicationId !== deletedId
      );
    });
  };

  return (
    <Box my="20px">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage
          {...(folderId
            ? messages.withThisWidgetFolder
            : messages.withThisWidget)}
          formatBold
        />
      </Text>
      <Box mb="40px">
        <TitleMultilocInput name="selection_title" />
      </Box>
      <Box mb="20px">
        <Label htmlFor="admin-publication-search-input">
          <FormattedMessage {...messages.selectProjectsOrFolders} />
        </Label>
        <AdminPublicationSearchInput
          adminPublicationIds={adminPublicationIds}
          folderId={folderId}
          onChange={handleAdd}
        />
      </Box>
      <AdminPublicationsList
        adminPublicationIds={adminPublicationIds}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default Settings;
