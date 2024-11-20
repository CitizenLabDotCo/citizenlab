import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import {
  SortableList,
  SortableRow,
  TextCell,
} from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';

import TitleMultilocInput from '../../_shared/TitleMultilocInput';
import messages from '../messages';

const Settings = () => {
  const {
    actions: { setProp },
    adminPublicationIds,
  } = useNode((node) => ({
    adminPublicationIds: node.data.props.adminPublicationIds,
  }));

  const handleReorder = () => {
    // TODO
  };

  return (
    <Box my="20px">
      <Text mb="32px" color="textSecondary">
        <FormattedMessage {...messages.inThisWidget} formatBold />
      </Text>
      <Box mb="20px">
        <TitleMultilocInput name="selection_title" />
      </Box>
      <SortableList
        items={adminPublicationIds}
        onReorder={handleReorder}
        key={adminPublicationIds.length}
      >
        {({ itemsList, handleDragRow, handleDropRow }) => (
          <>
            {itemsList.map((item, index) => (
              <SortableRow
                key={item.id}
                id={item.id}
                index={index}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
              >
                <TextCell>
                  <Text>{item.attributes.title_multiloc}</Text>
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
