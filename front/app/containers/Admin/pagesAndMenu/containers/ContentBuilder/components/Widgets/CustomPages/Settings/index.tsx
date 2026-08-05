import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { ICustomPageData } from 'api/custom_pages/types';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../../_shared/TitleMultilocInput';
import messages from '../messages';
import { CustomPageIconImage, CustomPageItem } from '../typings';

import CustomPageSearchInput from './CustomPageSearchInput';
import CustomPagesList from './CustomPagesList';
import { getNewIdsOnDrop } from './utils';

const Settings = () => {
  const {
    actions: { setProp },
    customPages,
  } = useNode<Pick<{ customPages: CustomPageItem[] }, 'customPages'>>(
    (node) => ({
      customPages: node.data.props.customPages,
    })
  );

  const handleAdd = (page?: ICustomPageData) => {
    if (!page) return;

    setProp((props: { customPages: CustomPageItem[] }) => {
      props.customPages = [...props.customPages, { id: page.id }];
    });
  };

  const handleReorder = (draggedItemId: string, targetIndex: number) => {
    setProp((props: { customPages: CustomPageItem[] }) => {
      const orderedIds = getNewIdsOnDrop(
        props.customPages.map((item) => item.id),
        draggedItemId,
        targetIndex
      );
      const itemsById = new Map(
        props.customPages.map((item) => [item.id, item])
      );
      props.customPages = orderedIds.flatMap((id) => {
        const item = itemsById.get(id);
        return item ? [item] : [];
      });
    });
  };

  const handleDelete = (deletedId: string) => {
    setProp((props: { customPages: CustomPageItem[] }) => {
      props.customPages = props.customPages.filter(
        (item) => item.id !== deletedId
      );
    });
  };

  // A card shows either an emoji or an uploaded image, so setting one clears
  // the other.
  const handleSetEmoji = (pageId: string, emoji: string | null) => {
    setProp((props: { customPages: CustomPageItem[] }) => {
      props.customPages = props.customPages.map((item) =>
        item.id === pageId ? { ...item, icon: emoji, image: null } : item
      );
    });
  };

  const handleSetImage = (
    pageId: string,
    image: CustomPageIconImage | null
  ) => {
    setProp((props: { customPages: CustomPageItem[] }) => {
      props.customPages = props.customPages.map((item) =>
        item.id === pageId
          ? { ...item, image, icon: image ? null : item.icon }
          : item
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
        onSetEmoji={handleSetEmoji}
        onSetImage={handleSetImage}
      />
    </Box>
  );
};

export default Settings;
