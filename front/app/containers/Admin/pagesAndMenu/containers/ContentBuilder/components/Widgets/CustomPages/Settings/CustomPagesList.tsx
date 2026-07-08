import React from 'react';

import {
  Box,
  IconButton,
  Label,
  Text,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCustomPages from 'api/custom_pages/useCustomPages';

import useLocalize from 'hooks/useLocalize';

import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import EmojiPickerInput from 'components/UI/EmojiPicker';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { getSelectedPages } from './utils';

const StyledSortableRow = styled(SortableRow)`
  & > div > div {
    padding: 0px !important;
    align-items: flex-start !important;

    & > div:nth-child(2) {
      margin-left: 8px;
    }
    & p {
      margin-top: 16px;
    }
  }
`;

interface Props {
  customPage: {
    id: string[];
    icon: Record<string, string | null>;
  };
  onReorder: (draggedItemId: string, targetIndex: number) => void;
  onDelete: (id: string) => void;
  onSetIcon: (pageId: string, emoji: string | null) => void;
}

const CustomPagesList = ({
  customPage,
  onReorder,
  onDelete,
  onSetIcon,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: customPages, isLoading } = useCustomPages();

  const items = getSelectedPages(customPages?.data, customPage.id).map(
    (page, index) => ({
      ...page,
      attributes: { ...page.attributes, ordering: index },
    })
  );

  return isLoading ? (
    <Spinner />
  ) : (
    <SortableList items={items} onReorder={onReorder} key={items.length}>
      {({ itemsList, handleDragRow, handleDropRow }) => (
        <>
          {itemsList.map((item, index) => (
            <StyledSortableRow
              key={item.id}
              id={item.id}
              index={index}
              moveRow={handleDragRow}
              dropRow={handleDropRow}
              disableNestedStyles
            >
              <Box w="100%" display="flex" flexDirection="column" gap="20px">
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap="8px"
                >
                  <Text m="0">{localize(item.attributes.title_multiloc)}</Text>
                  <IconButton
                    iconName="close"
                    onClick={() => onDelete(item.id)}
                    iconColor={colors.textSecondary}
                    iconColorOnHover={colors.black}
                    a11y_buttonActionMessage=""
                  />
                </Box>
                <Box>
                  <Label>{formatMessage(messages.cardIcon)}</Label>
                  <Box mb="16px">
                    <EmojiPickerInput
                      value={customPage.icon[item.id]}
                      onChange={(emoji) => onSetIcon(item.id, emoji)}
                      placement="top"
                    />
                  </Box>
                </Box>
              </Box>
            </StyledSortableRow>
          ))}
        </>
      )}
    </SortableList>
  );
};

export default CustomPagesList;
