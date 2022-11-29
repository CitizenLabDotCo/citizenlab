import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import { SortableRow } from '.';

const items = [
  { id: '_1', attributes: { ordering: 0 } },
  { id: '_2', attributes: { ordering: 1 } },
  { id: '_3', attributes: { ordering: 2 } },
];

describe('<SortableRow />', () => {
  it('calls the moveRow on dragging', () => {
    const handleDragRow = jest.fn();

    render(
      <DndProvider backend={HTML5Backend}>
        {items.map((item, i) => (
          <SortableRow
            key={item.id}
            id={item.id}
            index={i}
            moveRow={handleDragRow}
          >
            {`ITEM ID: ${item.id}`}
          </SortableRow>
        ))}
      </DndProvider>
    );

    const lastItem = screen.getByText('ITEM ID: _3');
    const middleItem = screen.getByText('ITEM ID: _2');

    fireEvent.dragStart(lastItem);
    fireEvent.dragEnter(middleItem);
    fireEvent.dragOver(middleItem);

    expect(handleDragRow).toHaveBeenCalledTimes(1);
    expect(handleDragRow).toHaveBeenCalledWith(2, 1);
  });
});
