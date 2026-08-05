import React from 'react';

import {
  Box,
  IconButton,
  Text,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCustomPages from 'api/custom_pages/useCustomPages';

import useLocalize from 'hooks/useLocalize';

import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';

import { CustomPageIconImage, CustomPageItem } from '../typings';

import CardIconInput from './CardIconInput';
import { getSelectedPages } from './utils';

const StyledSortableRow = styled(SortableRow)`
  & > div > div {
    padding: 0px !important;
    align-items: flex-start !important;

    /* Indents the row content and lines it up with the drag handle icon,
       which sits below the top of the row because of its own padding. */
    & > div:nth-child(2) {
      margin-left: 8px;
      margin-top: 16px;
    }
  }
`;

interface Props {
  customPages: CustomPageItem[];
  onReorder: (draggedItemId: string, targetIndex: number) => void;
  onDelete: (id: string) => void;
  onSetEmoji: (pageId: string, emoji: string | null) => void;
  onSetImage: (pageId: string, image: CustomPageIconImage | null) => void;
}

const CustomPagesList = ({
  customPages,
  onReorder,
  onDelete,
  onSetEmoji,
  onSetImage,
}: Props) => {
  const localize = useLocalize();
  const { data: customPagesData, isLoading } = useCustomPages();

  const selectedIds = customPages.map((item) => item.id);
  const itemById = new Map(customPages.map((item) => [item.id, item]));

  const items = getSelectedPages(customPagesData?.data, selectedIds).map(
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
              <Box
                w="100%"
                display="flex"
                flexDirection="column"
                gap="20px"
                pb="16px"
              >
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
                <CardIconInput
                  pageId={item.id}
                  emoji={itemById.get(item.id)?.icon ?? null}
                  image={itemById.get(item.id)?.image ?? null}
                  onChangeEmoji={(emoji) => onSetEmoji(item.id, emoji)}
                  onChangeImage={(image) => onSetImage(item.id, image)}
                />
              </Box>
            </StyledSortableRow>
          ))}
        </>
      )}
    </SortableList>
  );
};

export default CustomPagesList;
