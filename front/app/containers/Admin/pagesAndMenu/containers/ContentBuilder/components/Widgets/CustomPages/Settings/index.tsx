import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { ICustomPageData } from 'api/custom_pages/types';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../../_shared/TitleMultilocInput';
import messages from '../messages';

import CustomPageSearchInput from './CustomPageSearchInput';
import CustomPagesList from './CustomPagesList';
import { getNewIdsOnDrop } from './utils';

const Settings = () => {
  const {
    actions: { setProp },
    customPages,
  } = useNode((node) => ({
    customPages: node.data.props.customPages,
  }));

  const handleAdd = (page?: ICustomPageData) => {
    if (!page) return;

    setProp((props) => {
      props.customPages = [...props.customPages, { id: page.id }];
    });
  };

  const handleReorder = (draggedItemId: string, targetIndex: number) => {
    setProp((props) => {
      const orderedIds = getNewIdsOnDrop(
        props.customPages.map(
          (item: { id: string; icon?: string | null }) => item.id
        ),
        draggedItemId,
        targetIndex
      );
      const itemsById = new Map(
        props.customPages.map((item: { id: string; icon?: string | null }) => [
          item.id,
          item,
        ])
      );
      props.customPages = orderedIds.map((id) => itemsById.get(id));
    });
  };

  const handleDelete = (deletedId: string) => {
    setProp((props) => {
      props.customPages = props.customPages.filter(
        (item: { id: string; icon?: string | null }) => item.id !== deletedId
      );
    });
  };

  const handleSetIcon = (pageId: string, emoji: string | null) => {
    setProp((props) => {
      props.customPages = props.customPages.map(
        (item: { id: string; icon?: string | null }) =>
          item.id === pageId ? { ...item, icon: emoji } : item
      );
    });
  };

  return (
    <Box my="20px">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage {...messages.withThisWidget} formatBold />
      </Text>
      <Box mb="40px">
        <TitleMultilocInput name="custom_pages_title" />
      </Box>
      <Box mb="20px">
        <Label htmlFor="custom-page-search-input">
          <FormattedMessage {...messages.selectPages} />
        </Label>
        <CustomPageSearchInput
          customPageIds={customPages.map((item) => item.id)}
          onChange={handleAdd}
        />
      </Box>
      <CustomPagesList
        customPages={customPages}
        onReorder={handleReorder}
        onDelete={handleDelete}
        onSetIcon={handleSetIcon}
      />
    </Box>
  );
};

export default Settings;
