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
    customPageIds,
    pageIcons,
  } = useNode((node) => ({
    customPageIds: node.data.props.customPageIds,
    pageIcons: node.data.props.pageIcons,
  }));

  const handleAdd = (page?: ICustomPageData) => {
    if (!page) return;

    setProp((props) => {
      props.customPageIds = [...customPageIds, page.id];
    });
  };

  const handleReorder = (draggedItemId: string, targetIndex: number) => {
    setProp((props) => {
      props.customPageIds = getNewIdsOnDrop(
        customPageIds,
        draggedItemId,
        targetIndex
      );
    });
  };

  const handleDelete = (deletedId: string) => {
    setProp((props) => {
      props.customPageIds = customPageIds.filter(
        (customPageId: string) => customPageId !== deletedId
      );
      if (props.pageIcons) {
        const nextIcons = { ...props.pageIcons };
        delete nextIcons[deletedId];
        props.pageIcons = nextIcons;
      }
    });
  };

  const handleSetIcon = (pageId: string, emoji: string | null) => {
    setProp((props) => {
      const nextIcons: Record<string, string> = { ...(props.pageIcons ?? {}) };
      if (emoji) {
        nextIcons[pageId] = emoji;
      } else {
        delete nextIcons[pageId];
      }
      props.pageIcons = nextIcons;
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
          customPageIds={customPageIds}
          onChange={handleAdd}
        />
      </Box>
      <CustomPagesList
        customPageIds={customPageIds}
        pageIcons={pageIcons}
        onReorder={handleReorder}
        onDelete={handleDelete}
        onSetIcon={handleSetIcon}
      />
    </Box>
  );
};

export default Settings;
