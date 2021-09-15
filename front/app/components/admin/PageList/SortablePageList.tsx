import React from 'react';
import styled from 'styled-components';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import PageRow from './PageRow';

// typings
import { IPageData } from 'services/pages';
import { ChildProps as Props } from '.';

const StyledSortableRow = styled(SortableRow)`
  & .sortablerow-draghandle {
    align-self: flex-start;
    margin: auto 0px;
  }
`;

// temporary (until BE is in place)
type IPageDataWithOrdering = IPageData & {
  attributes: {
    ordering: number;
  };
};

function addOrdering(items: IPageData[]) {
  const orderedItems: IPageDataWithOrdering[] = [];

  for (let i = 0; i < items.length; i++) {
    const { attributes, ...rest } = items[i];

    const newItem: IPageDataWithOrdering = {
      ...rest,
      attributes: {
        ...attributes,
        ordering: i,
      },
    };

    orderedItems.push(newItem);
  }

  return orderedItems;
}

export default ({ pagesData, pagesPermissions }: Props) => {
  const orderedItems = addOrdering(pagesData);

  const handleReorder = (itemId, newOrder) => {
    console.log(itemId, newOrder);
  };

  return (
    <SortableList items={orderedItems} onReorder={handleReorder}>
      {({ itemsList, handleDragRow, handleDropRow }) => {
        return (
          <>
            {itemsList.map((item: IPageDataWithOrdering, i: number) => {
              return (
                <StyledSortableRow
                  key={item.id}
                  id={item.id}
                  index={i}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                  lastItem={i === itemsList.length - 1}
                >
                  <PageRow
                    pageData={item}
                    pagePermissions={pagesPermissions[i]}
                  />
                </StyledSortableRow>
              );
            })}
          </>
        );
      }}
    </SortableList>
  );
};
