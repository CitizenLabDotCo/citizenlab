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
    customPage,
  } = useNode((node) => ({
    customPage: node.data.props.customPage,
  }));

  const handleAdd = (page?: ICustomPageData) => {
    if (!page) return;

    setProp((props) => {
      props.customPage.id = [...props.customPage.id, page.id];
    });
  };

  const handleReorder = (draggedItemId: string, targetIndex: number) => {
    setProp((props) => {
      props.customPage.id = getNewIdsOnDrop(
        props.customPage.id,
        draggedItemId,
        targetIndex
      );
    });
  };

  const handleDelete = (deletedId: string) => {
    setProp((props) => {
      props.customPage.id = props.customPage.id.filter(
        (customPageId: string) => customPageId !== deletedId
      );
      if (props.customPage.icon) {
        const nextIcons = { ...props.customPage.icon };
        delete nextIcons[deletedId];
        props.customPage.icon = nextIcons;
      }
    });
  };

  const handleSetIcon = (pageId: string, emoji: string | null) => {
    setProp((props) => {
      const nextIcons: Record<string, string | null> = {
        ...props.customPage.icon,
      };
      if (emoji) {
        nextIcons[pageId] = emoji;
      } else {
        delete nextIcons[pageId];
      }
      props.customPage.icon = nextIcons;
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
          customPageIds={customPage.id}
          onChange={handleAdd}
        />
      </Box>
      <CustomPagesList
        customPage={{ id: customPage.id, icon: customPage.icon }}
        onReorder={handleReorder}
        onDelete={handleDelete}
        onSetIcon={handleSetIcon}
      />
    </Box>
  );
};

export default Settings;
