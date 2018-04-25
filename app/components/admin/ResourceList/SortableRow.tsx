import React from 'react';
import styled from 'styled-components';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import { Row } from 'components/admin/ResourceList';
import { Icon } from 'semantic-ui-react';

const DragHandle = styled.div`
  cursor: move;
  padding: 1rem;
`;

type Props = {
  connectDragSource: any;
  connectDropTarget: any;
  isDragging: boolean;
  index: number;
  id: string;
  lastItem: boolean;
  moveRow: (fromIndex: number, toIndex: number) => void;
  dropRow: (itemId: string, toIndex, number) => void;
};

type State = {};

class SortableRow extends React.Component<Props, State> {
  render() {
    const { connectDropTarget, connectDragSource, isDragging, lastItem } = this.props;
    const opacity = isDragging ? 0 : 1;
    return connectDropTarget(connectDragSource(
      <div style={{ opacity }}>
        <Row lastItem={lastItem}>
          <DragHandle>
            <Icon name="sort" />
          </DragHandle>
          {this.props.children}
        </Row>
      </div>
    ));
  }
}

const dragSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const dropTarget = {
  hover(props, monitor, component) {
    const fromIndex = monitor.getItem().index;
    const toIndex = props.index;

    // Don't replace items with themselves
    if (fromIndex === toIndex) {
      return;
    }

    // Determine rectangle on screen
    const domNode = findDOMNode(component);
    const hoverBoundingRect = (domNode as Element).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (fromIndex < toIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (fromIndex > toIndex && hoverClientY > hoverMiddleY) {
      return;
    }
    // Time to actually perform the action
    props.moveRow(fromIndex, toIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = toIndex;
  },
  drop(props, monitor) {
    const { id } = monitor.getItem();
    const toIndex = props.index;
    props.dropRow(id, toIndex);
  }
};


export default
  DropTarget('ROW', dropTarget, (connect) => ({
    connectDropTarget: connect.dropTarget(),
  }))(
  DragSource('ROW', dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }))(SortableRow));
