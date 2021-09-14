import React, { Component } from 'react';
import { clone, find } from 'lodash-es';

import { DragDropContext } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { List } from 'components/admin/ResourceList';
import itemOrderWasUpdated from './itemOrderWasUpdated';

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
  className?: string;
  id?: string;
}

type RenderProps = {
  itemsList: Item[];
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  handleDropRow: (itemId: string, toIndex: number) => void;
};

export interface SortableListState {
  itemsWhileDragging: Item[] | null;
  updating: boolean;
}

export class SortableList extends Component<InputProps, SortableListState> {
  constructor(props) {
    super(props);
    this.state = {
      itemsWhileDragging: null,
      updating: false
    };
  }

  // This ensures that this.state.itemsWhileDragging are used to render the
  // children until the request to the server to update the order has been
  // completed, and the updated order has come back in through the props.
  componentDidUpdate = (prevProps) => {
    if (
      this.state.updating &&
      itemOrderWasUpdated(prevProps.items, this.props.items)
    ) {
      this.setState({ itemsWhileDragging: null, updating: false });
    }
  };

  handleDragRow = (fromIndex, toIndex) => {
    const listItems = this.listItems();
    if (!listItems) return;

    const itemsWhileDragging = clone(listItems);
    itemsWhileDragging.splice(fromIndex, 1);
    itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
    this.setState({ itemsWhileDragging });
  };

  handleDropRow = (itemId, toIndex) => {
    const listItems = this.listItems();

    if (!listItems) return;

    const item = find(listItems, { id: itemId });

    if (item && item.attributes.ordering !== toIndex) {
      this.props.onReorder(itemId, toIndex);
      this.setState({ updating: true })
    } else {
      this.setState({ itemsWhileDragging: null });
    }
  };

  listItems = () => {
    const { items } = this.props;
    return this.state.itemsWhileDragging || items;
  };

  render() {
    const itemsList = this.listItems() || [];
    const { children, id, className } = this.props;

    return (
      <List id={id} className={className}>
        {children({
          itemsList,
          handleDragRow: this.handleDragRow,
          handleDropRow: this.handleDropRow,
        })}
      </List>
    );
  }
}

export default DragDropContext(HTML5Backend)(SortableList);
