import React from 'react';
import { clone, find } from 'lodash';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { List } from 'components/admin/ResourceList';

export interface InputProps {
  items: any[];
  onReorder: (fieldId: string, newOrder: number) => void;
  children: (renderProps: RenderProps) => JSX.Element | null ;
}

type RenderProps = {
  itemsList: any[];
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  handleDropRow: (itemId: string, toIndex: number) => void;
};

export interface SortableListState {
  itemsWhileDragging: any[] | null;
}

export class SortableList extends React.Component<InputProps, SortableListState> {
  constructor(props) {
    super(props);
    this.state = {
      itemsWhileDragging: null,
    };
  }

  handleDragRow = (fromIndex, toIndex) => {
    const listItems = this.listItems();
    if (!listItems) return;

    const itemsWhileDragging = clone(listItems);
    itemsWhileDragging.splice(fromIndex, 1);
    itemsWhileDragging.splice(toIndex, 0, listItems[fromIndex]);
    this.setState({ itemsWhileDragging });
  }

  handleDropRow = (itemId, toIndex) => {
    const listItems = this.listItems();
    if (!listItems) return;
    const item = find(listItems, { id: itemId });
    if (item && item.attributes.ordering !== toIndex) {
      this.props.onReorder(itemId, toIndex);
    } else {
      this.setState({ itemsWhileDragging: null });
    }
  }

  listItems = () => {
    const { items } = this.props;
    return this.state.itemsWhileDragging || items;
  }

  render() {
    const itemsList = this.listItems() || [];
    const { children } = this.props;

    return (
      <List className={this.props['className']}>
        {children({ itemsList, handleDragRow: this.handleDragRow, handleDropRow: this.handleDropRow })}
      </List>
    );
  }
}

export default DragDropContext<InputProps>(HTML5Backend)(SortableList);
