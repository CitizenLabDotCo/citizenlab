import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import SortableList from './SortableList';

const items = [
  { id: '_1', attributes: { ordering: 0 } },
  { id: '_2', attributes: { ordering: 1 } },
  { id: '_3', attributes: { ordering: 2 } },
];

describe('<SortableList />', () => {
  it('passed correct items to render prop', () => {
    const onReorder = () => {};

    let _handleDragRow;
    let _handleDropRow;

    const renderProp = jest.fn(
      ({ itemsList, handleDragRow, handleDropRow }) => {
        _handleDragRow = handleDragRow;
        _handleDropRow = handleDropRow;

        return (
          <>
            {itemsList.map((item) => (
              <div key={item.id} data-testid={'testid'}>
                {item.id}
              </div>
            ))}
          </>
        );
      }
    );

    render(
      <SortableList items={items} onReorder={onReorder}>
        {renderProp}
      </SortableList>
    );

    expect(renderProp).toHaveBeenCalledWith({
      itemsList: items,
      handleDragRow: _handleDragRow,
      handleDropRow: _handleDropRow,
    });

    expect(screen.getAllByTestId('testid')).toHaveLength(3);
  });

  it('calls onReorder when dragging changes the order', () => {
    const onReorder = jest.fn();

    let _itemsList;
    let _handleDragRow;
    let _handleDropRow;

    const renderProp = ({ itemsList, handleDragRow, handleDropRow }) => {
      _itemsList = itemsList;
      _handleDragRow = handleDragRow;
      _handleDropRow = handleDropRow;

      return (
        <>
          {itemsList.map((item) => (
            <div key={item.id}>{item.id}</div>
          ))}
        </>
      );
    };

    render(
      <SortableList items={items} onReorder={onReorder}>
        {renderProp}
      </SortableList>
    );

    _handleDragRow(1, 0);
    _handleDropRow(items[1].id, 0);

    expect(onReorder).toHaveBeenCalledWith('_2', 0);
    expect(_itemsList).toEqual([
      { id: '_2', attributes: { ordering: 1 } },
      { id: '_1', attributes: { ordering: 0 } },
      { id: '_3', attributes: { ordering: 2 } },
    ]);
  });

  it('does not call onReorder when dragging does not change the order', () => {
    const onReorder = jest.fn();

    let _itemsList;
    let _handleDragRow;
    let _handleDropRow;

    const renderProp = ({ itemsList, handleDragRow, handleDropRow }) => {
      _itemsList = itemsList;
      _handleDragRow = handleDragRow;
      _handleDropRow = handleDropRow;

      return (
        <>
          {itemsList.map((item) => (
            <div key={item.id}>{item.id}</div>
          ))}
        </>
      );
    };

    render(
      <SortableList items={items} onReorder={onReorder}>
        {renderProp}
      </SortableList>
    );

    _handleDragRow(1, 0);
    _handleDragRow(0, 1);
    _handleDropRow(items[1].id, 1);

    expect(onReorder).not.toHaveBeenCalled();
    expect(_itemsList).toEqual([
      { id: '_1', attributes: { ordering: 0 } },
      { id: '_2', attributes: { ordering: 1 } },
      { id: '_3', attributes: { ordering: 2 } },
    ]);
  });

  it('correctly updates when onReorder modifies items input', () => {
    let modifiableItems = [...items];

    const onReorder = jest.fn((itemId, toIndex) => {
      const fromIndex = modifiableItems.findIndex((item) => itemId === item.id);
      const item = modifiableItems[fromIndex];

      modifiableItems.splice(fromIndex, 1);
      modifiableItems.splice(toIndex, 0, item);

      // reset ordering
      for (let i = 0; i < modifiableItems.length; i++) {
        modifiableItems[i].attributes.ordering = i;
      }
    });

    let _itemsList;
    let _handleDragRow;
    let _handleDropRow;

    const renderProp = ({ itemsList, handleDragRow, handleDropRow }) => {
      _itemsList = itemsList;
      _handleDragRow = handleDragRow;
      _handleDropRow = handleDropRow;

      return (
        <>
          {itemsList.map((item) => (
            <div key={item.id}>{item.id}</div>
          ))}
        </>
      );
    };

    render(
      <SortableList items={modifiableItems} onReorder={onReorder}>
        {renderProp}
      </SortableList>
    );

    _handleDragRow(0, 2);
    _handleDropRow(modifiableItems[0].id, 2);

    expect(onReorder).toHaveBeenCalledWith('_1', 2);

    const expectedItems = [
      { id: '_2', attributes: { ordering: 0 } },
      { id: '_3', attributes: { ordering: 1 } },
      { id: '_1', attributes: { ordering: 2 } },
    ];

    expect(modifiableItems).toEqual(expectedItems);
    expect(_itemsList).toEqual(expectedItems);
  });
});
