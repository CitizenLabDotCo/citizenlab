import React from 'react';

import { cloneDeep } from 'lodash-es';

import { act, render, screen } from 'utils/testUtils/rtl';

import SortableList, { RenderProps } from './SortableList';

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
      ({ itemsList, handleDragRow, handleDropRow }: RenderProps) => {
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

    act(() => {
      render(
        <SortableList items={items} onReorder={onReorder}>
          {renderProp}
        </SortableList>
      );
    });

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

    const renderProp = ({
      itemsList,
      handleDragRow,
      handleDropRow,
    }: RenderProps) => {
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
    act(() => {
      _handleDragRow(1, 0);
      _handleDropRow('_2', 0);
    });

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

    const renderProp = ({
      itemsList,
      handleDragRow,
      handleDropRow,
    }: RenderProps) => {
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
    act(() => {
      _handleDragRow(1, 0);
      _handleDragRow(0, 1);
      _handleDropRow('_2', 1);
    });

    expect(onReorder).not.toHaveBeenCalled();
    expect(_itemsList).toEqual([
      { id: '_1', attributes: { ordering: 0 } },
      { id: '_2', attributes: { ordering: 1 } },
      { id: '_3', attributes: { ordering: 2 } },
    ]);
  });

  it('correctly updates when onReorder modifies items input', () => {
    const modifiableItems = cloneDeep(items);

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

    const renderProp = ({
      itemsList,
      handleDragRow,
      handleDropRow,
    }: RenderProps) => {
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
    act(() => {
      _handleDragRow(0, 2);
      _handleDropRow('_1', 2);
    });

    expect(onReorder).toHaveBeenCalledWith('_1', 2);

    const expectedItems = [
      { id: '_2', attributes: { ordering: 0 } },
      { id: '_3', attributes: { ordering: 1 } },
      { id: '_1', attributes: { ordering: 2 } },
    ];

    expect(modifiableItems).toEqual(expectedItems);
    expect(_itemsList).toEqual(expectedItems);
  });

  it('works with multiple reorderings', () => {
    const modifiableItems = cloneDeep(items);

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

    const renderProp = ({
      itemsList,
      handleDragRow,
      handleDropRow,
    }: RenderProps) => {
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

    act(() => {
      _handleDragRow(0, 2);
      _handleDropRow('_1', 2);
    });

    expect(onReorder).toHaveBeenCalledWith('_1', 2);

    const expectedItems = [
      { id: '_2', attributes: { ordering: 0 } },
      { id: '_3', attributes: { ordering: 1 } },
      { id: '_1', attributes: { ordering: 2 } },
    ];

    expect(modifiableItems).toEqual(expectedItems);
    expect(_itemsList).toEqual(expectedItems);

    act(() => {
      _handleDragRow(1, 2);
      _handleDropRow('_3', 2);
    });

    expect(onReorder).toHaveBeenCalledWith('_3', 2);

    const expectedItems2 = [
      { id: '_2', attributes: { ordering: 0 } },
      { id: '_1', attributes: { ordering: 1 } },
      { id: '_3', attributes: { ordering: 2 } },
    ];

    expect(modifiableItems).toEqual(expectedItems2);
    expect(_itemsList).toEqual(expectedItems2);
  });

  it('works when first item is locked', () => {
    const modifiableItems = cloneDeep(items);

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

    let _lockedItemsList;
    let _itemsList;
    let _handleDragRow;
    let _handleDropRow;

    const renderProp = ({
      lockedItemsList,
      itemsList,
      handleDragRow,
      handleDropRow,
    }: RenderProps) => {
      _lockedItemsList = lockedItemsList;
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
      <SortableList
        items={modifiableItems}
        onReorder={onReorder}
        lockFirstNItems={1}
      >
        {renderProp}
      </SortableList>
    );

    act(() => {
      _handleDragRow(1, 0); // actually (2, 1), since the first item is locked
      _handleDropRow('_3', 0); // actually ('_3'), 1), since first item is locked
    });

    expect(onReorder).toHaveBeenCalledWith('_3', 1);

    const expectedModifiableItems = [
      { id: '_1', attributes: { ordering: 0 } },
      { id: '_3', attributes: { ordering: 1 } },
      { id: '_2', attributes: { ordering: 2 } },
    ];

    const expectedLockedItemsList = [{ id: '_1', attributes: { ordering: 0 } }];

    const expectedItemsList = [
      { id: '_3', attributes: { ordering: 1 } },
      { id: '_2', attributes: { ordering: 2 } },
    ];

    expect(modifiableItems).toEqual(expectedModifiableItems);
    expect(_lockedItemsList).toEqual(expectedLockedItemsList);
    expect(_itemsList).toEqual(expectedItemsList);
  });

  it('works when multiple items are locked with multiple reorderings', () => {
    const modifiableItems = [
      { id: '_1', attributes: { ordering: 0 } },
      { id: '_2', attributes: { ordering: 1 } },
      { id: '_3', attributes: { ordering: 2 } },
      { id: '_4', attributes: { ordering: 3 } },
      { id: '_5', attributes: { ordering: 4 } },
      { id: '_6', attributes: { ordering: 5 } },
    ];

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

    let _lockedItemsList;
    let _itemsList;
    let _handleDragRow;
    let _handleDropRow;

    const renderProp = ({
      lockedItemsList,
      itemsList,
      handleDragRow,
      handleDropRow,
    }: RenderProps) => {
      _lockedItemsList = lockedItemsList;
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
      <SortableList
        items={modifiableItems}
        onReorder={onReorder}
        lockFirstNItems={2}
      >
        {renderProp}
      </SortableList>
    );

    act(() => {
      _handleDragRow(0, 2);
      _handleDropRow('_3', 2);
    });

    expect(onReorder).toHaveBeenCalledWith('_3', 4);

    const expectedModifiableItems = [
      { id: '_1', attributes: { ordering: 0 } },
      { id: '_2', attributes: { ordering: 1 } },
      { id: '_4', attributes: { ordering: 2 } },
      { id: '_5', attributes: { ordering: 3 } },
      { id: '_3', attributes: { ordering: 4 } },
      { id: '_6', attributes: { ordering: 5 } },
    ];

    const expectedLockedItemsList = [
      { id: '_1', attributes: { ordering: 0 } },
      { id: '_2', attributes: { ordering: 1 } },
    ];

    const expectedItemsList = [
      { id: '_4', attributes: { ordering: 2 } },
      { id: '_5', attributes: { ordering: 3 } },
      { id: '_3', attributes: { ordering: 4 } },
      { id: '_6', attributes: { ordering: 5 } },
    ];

    expect(modifiableItems).toEqual(expectedModifiableItems);
    expect(_lockedItemsList).toEqual(expectedLockedItemsList);
    expect(_itemsList).toEqual(expectedItemsList);
    act(() => {
      _handleDragRow(3, 0);
      _handleDropRow('_6', 0);
    });

    expect(onReorder).toHaveBeenCalledWith('_6', 2);

    const expectedModifiableItems2 = [
      { id: '_1', attributes: { ordering: 0 } },
      { id: '_2', attributes: { ordering: 1 } },
      { id: '_6', attributes: { ordering: 2 } },
      { id: '_4', attributes: { ordering: 3 } },
      { id: '_5', attributes: { ordering: 4 } },
      { id: '_3', attributes: { ordering: 5 } },
    ];

    const expectedItemsList2 = [
      { id: '_6', attributes: { ordering: 2 } },
      { id: '_4', attributes: { ordering: 3 } },
      { id: '_5', attributes: { ordering: 4 } },
      { id: '_3', attributes: { ordering: 5 } },
    ];

    expect(modifiableItems).toEqual(expectedModifiableItems2);
    expect(_lockedItemsList).toEqual(expectedLockedItemsList);
    expect(_itemsList).toEqual(expectedItemsList2);
  });
});
