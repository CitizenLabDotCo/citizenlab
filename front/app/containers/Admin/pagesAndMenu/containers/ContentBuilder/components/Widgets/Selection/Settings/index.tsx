import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../../_shared/TitleMultilocInput';
import messages from '../messages';

import AdminPublicationSearchInput from './AdminPublicationSearchInput';
import AdminPublicationsList from './AdminPublicationsList';
import { getNewIdsOnDrop } from './utils';

const Settings = () => {
  const {
    actions: { setProp },
    adminPublicationIds,
  } = useNode((node) => ({
    adminPublicationIds: node.data.props.adminPublicationIds,
  }));

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
          onChange={(adminPublication) => {
            if (!adminPublication) return;
            setProp((props) => {
              props.adminPublicationIds = [
                ...adminPublicationIds,
                adminPublication.id,
              ];
            });
          }}
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
