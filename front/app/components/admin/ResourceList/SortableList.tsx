import React, { useEffect, useState } from 'react';
import { clone, find } from 'lodash-es';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { List } from 'components/admin/ResourceList';
// import { itemOrderWasUpdated, orderingIsValid } from './utils';
import { itemOrderWasUpdated } from './utils';
import usePrevious from 'hooks/usePrevious';

export interface Item {
  id: string;
  attributes: {
    ordering: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface InputProps {
  items: Item[];
  onReorder: (fieldId: string, newOrder: number) => void;
  children: (renderProps: RenderProps) => JSX.Element | JSX.Element[] | null;
  lockFirstNItems?: number;
  className?: string;
  id?: string;
}

export interface RenderProps {
  lockedItemsList?: Item[];
  itemsList: Item[];
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  handleDropRow: (itemId: string, toIndex: number) => void;
}

const SortableList = ({
  lockFirstNItems = 0,
  items,
  onReorder,
  children,
  id,
  className,
}: InputProps) => {
  const [itemsWhileDragging, setItemsWhileDragging] = useState<Item[] | null>(
    null
  );
  const [updating, setUpdating] = useState(false);
  const prevItems = usePrevious(items);

  useEffect(() => {
    if (updating && itemOrderWasUpdated(prevItems, items)) {
      setItemsWhileDragging(null);
      setUpdating(false);
    }
  }, [updating, prevItems, items]);

  const getLocalIndex = (externalIndex: number) => {
    return externalIndex - lockFirstNItems;
  };

  const getExternalIndex = (localIndex: number) => {
    return localIndex + lockFirstNItems;
  };

  const handleDragRow = (fromIndex: number, toIndex: number) => {
    const listItems = getListItems();
    if (!listItems) return;

    const itemsWhileDragging = clone(listItems);
    itemsWhileDragging.splice(fromIndex, 1);
    itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
    setItemsWhileDragging(itemsWhileDragging);
  };

  const handleDropRow = (itemId: string, toIndex: number) => {
    const listItems = getListItems();

    if (!listItems) return;

    const item = find(listItems, { id: itemId });

    if (item && getLocalIndex(item.attributes.ordering) !== toIndex) {
      onReorder(itemId, getExternalIndex(toIndex));
    } else {
      setItemsWhileDragging(null);
    }
  };

  const lockedItems = () => {
    if (!lockFirstNItems || lockFirstNItems <= 0) return;
    return [...items].splice(0, lockFirstNItems);
  };

  const getListItems = () => {
    if (!lockFirstNItems || lockFirstNItems <= 0) {
      return itemsWhileDragging || items;
    }

    return (
      itemsWhileDragging || clone(items).splice(lockFirstNItems, items.length)
    );
  };

  const lockedItemsList = lockedItems();
  const itemsList = getListItems() || [];

  return (
    <List id={id} className={className}>
      {children({
        lockedItemsList,
        itemsList,
        handleDragRow,
        handleDropRow,
      })}
    </List>
  );
};

export default (props: InputProps) => (
  <DndProvider backend={HTML5Backend}>
    <SortableList {...props} />
  </DndProvider>
);
