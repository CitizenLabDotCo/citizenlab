import React from 'react';
// components
import {
  SortableList,
  SortableRow,
  LockedRow,
} from 'components/admin/ResourceList';
import PageRow from './PageRow';

// typings
import { IPageData } from 'services/pages';
import { ChildProps as Props } from '.';

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

export default ({ pagesData, pagesPermissions, lockFirstNItems }: Props) => {
  const orderedItems = addOrdering(pagesData);

  const handleReorder = (itemId, newOrder) => {
    console.log(itemId, newOrder);
  };

  return (
    <SortableList
      items={orderedItems}
      onReorder={handleReorder}
      lockFirstNItems={lockFirstNItems}
    >
      {({ lockedItemsList, itemsList, handleDragRow, handleDropRow }) => {
        return (
          <>
            {lockedItemsList &&
              lockedItemsList.map((item: IPageDataWithOrdering, i: number) => {
                return (
                  <LockedRow
                    key={item.id}
                    isLastItem={i === itemsList.length - 1}
                  >
                    <PageRow
                      pageData={item}
                      pagePermissions={pagesPermissions[i]}
                    />
                  </LockedRow>
                );
              })}

            {itemsList.map((item: IPageDataWithOrdering, i: number) => {
              return (
                <SortableRow
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
                </SortableRow>
              );
            })}
          </>
        );
      }}
    </SortableList>
  );
};
