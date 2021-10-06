import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import SortableList from './SortableList';
import SortableRow from './SortableRow';

const items = [
  { id: '_1', attributes: { ordering: 0 } },
  { id: '_2', attributes: { ordering: 1 } },
  { id: '_3', attributes: { ordering: 2 } },
];

describe('<SortableRow />', () => {
  it('drag and drops correctly', () => {
    const onReorder = jest.fn();

    render(
      <SortableList items={items} onReorder={onReorder}>
        {({ itemsList, handleDragRow, handleDropRow }) => {
          return itemsList.map((item, i) => (
            <SortableRow
              key={item.id}
              id={item.id}
              index={i}
              moveRow={handleDragRow}
              dropRow={handleDropRow}
            >
              {`ITEM ID: ${item.id}`}
            </SortableRow>
          ));
        }}
      </SortableList>
    );

    const lastItem = screen.getByText('ITEM ID: _3');
    const middleItem = screen.getByText('ITEM ID: _2');

    fireEvent.dragStart(lastItem);
    fireEvent.dragEnter(middleItem);
    fireEvent.dragOver(middleItem);
    fireEvent.drop(middleItem);

    expect(onReorder).toHaveBeenCalledWith('_3', 1);
  });

  it('parent does not call onReorder if item is dropped in same place', () => {
    const onReorder = jest.fn();

    render(
      <SortableList items={items} onReorder={onReorder}>
        {({ itemsList, handleDragRow, handleDropRow }) => {
          return itemsList.map((item, i) => (
            <SortableRow
              key={item.id}
              id={item.id}
              index={i}
              moveRow={handleDragRow}
              dropRow={handleDropRow}
            >
              {`ITEM ID: ${item.id}`}
            </SortableRow>
          ));
        }}
      </SortableList>
    );

    const lastItem = screen.getByText('ITEM ID: _3');
    const middleItem = screen.getByText('ITEM ID: _2');

    fireEvent.dragStart(lastItem);
    fireEvent.dragEnter(middleItem);
    fireEvent.dragOver(middleItem);
    fireEvent.dragEnter(lastItem);
    fireEvent.dragOver(lastItem);
    fireEvent.drop(lastItem);

    expect(onReorder).not.toHaveBeenCalled();
  });
});
