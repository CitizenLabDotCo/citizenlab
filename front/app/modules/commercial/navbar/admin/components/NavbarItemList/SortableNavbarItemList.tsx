import React from 'react';
// components
import {
  SortableList,
  SortableRow,
  LockedRow,
} from 'components/admin/ResourceList';
import PageRow from './NavbarItemRow';

// typings
import { INavbarItem } from 'services/navbar';
import { ChildProps as Props } from '.';

export default ({
  navbarItems,
  getDisplaySettings,
  lockFirstNItems,
  onClickAddButton,
  onClickHideButton,
}: Props) => {
  // const handleReorder = (itemId, newOrder) => {
  //   console.log(itemId, newOrder);
  // };
  const handleReorder = () => {};

  return (
    <SortableList
      items={navbarItems}
      onReorder={handleReorder}
      lockFirstNItems={lockFirstNItems}
    >
      {({ lockedItemsList, itemsList, handleDragRow, handleDropRow }) => (
        <>
          {lockedItemsList &&
            lockedItemsList.map((navbarItem: INavbarItem, i: number) => (
              <LockedRow
                key={navbarItem.id}
                isLastItem={i === itemsList.length - 1}
              >
                <PageRow
                  navbarItem={navbarItem}
                  displaySettings={getDisplaySettings(navbarItem)}
                  onClickAddButton={onClickAddButton}
                  onClickHideButton={onClickHideButton}
                />
              </LockedRow>
            ))}

          {itemsList.map((navbarItem: INavbarItem, i: number) => (
            <SortableRow
              key={navbarItem.id}
              id={navbarItem.id}
              index={i}
              moveRow={handleDragRow}
              dropRow={handleDropRow}
              isLastItem={i === itemsList.length - 1}
            >
              <PageRow
                navbarItem={navbarItem}
                displaySettings={getDisplaySettings(navbarItem)}
                onClickAddButton={onClickAddButton}
                onClickHideButton={onClickHideButton}
              />
            </SortableRow>
          ))}
        </>
      )}
    </SortableList>
  );
};
