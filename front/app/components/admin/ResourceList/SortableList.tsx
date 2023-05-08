import React, { Component } from 'react';
import { clone, find } from 'lodash-es';

import { DndProvider } from 'react-dnd-cjs';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { List } from 'components/admin/ResourceList';
// import { itemOrderWasUpdated, orderingIsValid } from './utils';
import { itemOrderWasUpdated } from './utils';

export interface Item {
  id: string;
  attributes: {
    ordering: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface InputProps {
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

export interface SortableListState {
  itemsWhileDragging: Item[] | null;
  updating: boolean;
}

export class SortableList extends Component<InputProps, SortableListState> {
  constructor(props: InputProps) {
    super(props);
    this.state = {
      itemsWhileDragging: null,
      updating: false,
    };
  }

  // This ensures that this.state.itemsWhileDragging are used to render the
  // children until the request to the server to update the order has been
  // completed, and the updated order has come back in through the props.
  componentDidUpdate = (prevProps: InputProps) => {
    if (
      this.state.updating &&
      itemOrderWasUpdated(prevProps.items, this.props.items) // &&
      // orderingIsValid(this.props.items)
      // Skipping this for now because of more issues with the ordering
      // TODO: fix
    ) {
      this.setState({ itemsWhileDragging: null, updating: false });
    }
  };

  getLocalIndex(externalIndex: number) {
    const lockFirstNItems = this.props.lockFirstNItems || 0;
    return externalIndex - lockFirstNItems;
  }

  getExternalIndex(localIndex: number) {
    const lockFirstNItems = this.props.lockFirstNItems || 0;
    return localIndex + lockFirstNItems;
  }

  handleDragRow = (fromIndex: number, toIndex: number) => {
    const listItems = this.listItems();
    if (!listItems) return;

    const itemsWhileDragging = clone(listItems);
    itemsWhileDragging.splice(fromIndex, 1);
    itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
    this.setState({ itemsWhileDragging });
  };

  handleDropRow = (itemId: string, toIndex: number) => {
    const listItems = this.listItems();

    if (!listItems) return;

    const item = find(listItems, { id: itemId });

    if (item && this.getLocalIndex(item.attributes.ordering) !== toIndex) {
      this.props.onReorder(itemId, this.getExternalIndex(toIndex));
      this.setState({ updating: true });
    } else {
      this.setState({ itemsWhileDragging: null });
    }
  };

  lockedItems = () => {
    const lockFirstNItems = this.props.lockFirstNItems;

    if (!lockFirstNItems || lockFirstNItems <= 0) return;
    return [...this.props.items].splice(0, lockFirstNItems);
  };

  listItems = () => {
    const lockFirstNItems = this.props.lockFirstNItems;
    const { items } = this.props;
    const { itemsWhileDragging } = this.state;

    if (!lockFirstNItems || lockFirstNItems <= 0) {
      return itemsWhileDragging || items;
    }

    return (
      itemsWhileDragging || clone(items).splice(lockFirstNItems, items.length)
    );
  };

  render() {
    const lockedItemsList = this.lockedItems();
    const itemsList = this.listItems() || [];
    const { children, id, className } = this.props;

    return (
      <List id={id} className={className}>
        {children({
          lockedItemsList,
          itemsList,
          handleDragRow: this.handleDragRow,
          handleDropRow: this.handleDropRow,
        })}
      </List>
    );
  }
}

export default (props: InputProps) => (
  <DndProvider backend={HTML5Backend}>
    <SortableList {...props} />
  </DndProvider>
);
