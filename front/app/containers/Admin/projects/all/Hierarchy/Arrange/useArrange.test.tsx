import React from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from 'utils/testUtils/rtl';

import MoreActions from '../Menu/MoreActions';
import ToastProvider from '../Toast/ToastProvider';

import { ArrangePlace } from './arrangeTargets';
import DragHandle from './DragHandle';
import useArrange from './useArrange';
import useArrangeGroup, { ArrangeGroupContext } from './useArrangeGroup';
import useDragArrange from './useDragArrange';

type Reorder = (ordering: number) => Promise<unknown>;

// Three items, kept at orderings 2, 5 and 6.
const items = [2, 5, 6].map((ordering, index) => ({
  id: `item-${index}`,
  attributes: { ordering },
}));

interface ItemProps {
  id: string;
  place?: ArrangePlace;
  reorder: Reorder;
}

const Item = ({ id, place, reorder }: ItemProps) => {
  const { entries, arrangeTo } = useArrange(place && { place, reorder });
  const drag = useDragArrange({ id, place, arrangeTo });

  return (
    <div ref={drag.item} data-testid={id}>
      <DragHandle handle={drag.handle} />
      <MoreActions entries={entries} />
    </div>
  );
};

// Each item moves its own way, so a test can tell which one moved.
const Group = ({ reorders }: { reorders: Reorder[] }) => {
  const { shown, placeOf, group } = useArrangeGroup({
    kind: 'project',
    items,
    hasMore: false,
    arrangeable: true,
  });

  return (
    <ArrangeGroupContext.Provider value={group}>
      {shown.map((item) => (
        <Item
          key={item.id}
          id={item.id}
          place={placeOf(item)}
          reorder={reorders[items.indexOf(item)]}
        />
      ))}
    </ArrangeGroupContext.Provider>
  );
};

const renderItems = (reorders: Reorder[]) =>
  render(
    <DndProvider backend={HTML5Backend}>
      <ToastProvider>
        <Group reorders={reorders} />
      </ToastProvider>
    </DndProvider>
  );

const shownOrder = () =>
  screen.getAllByTestId(/^item-/).map((element) => element.dataset.testid);

// The items as rows 100 high, one under the other, in the order shown: jsdom
// lays nothing out, and a drag goes by where the pointer is on them.
const layOutAsRows = () =>
  jest
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const index = screen.queryAllByTestId(/^item-/).indexOf(this);
      const top = index * 100;
      return {
        x: 0,
        y: top,
        left: 0,
        top,
        width: 200,
        height: 100,
        right: 200,
        bottom: top + 100,
        toJSON: () => ({}),
      };
    });

// Moves the pointer over an item, at that height on the page. jsdom's drag
// events carry no pointer position, so these are mouse events of the same
// type, which do. The drag backend reads the pointer once a frame, so this
// waits for one.
const pointAt = async (overId: string, y: number) => {
  const over = screen.getByTestId(overId);
  ['dragenter', 'dragover'].forEach((type) =>
    fireEvent(
      over,
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: y,
      })
    )
  );
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
};

// Drags one item over another, at that height on the page.
const dragOver = async (draggedId: string, overId: string, y: number) => {
  fireEvent.dragStart(gripOf(draggedId));
  await pointAt(overId, y);
};

// The grip's icon, inside the element the drag starts from.
const gripOf = (id: string) => {
  const grip = screen.getByTestId(id).querySelector('[data-grip] svg');
  if (!grip) throw new Error(`${id} has no grip`);
  return grip;
};

const resolving = () => jest.fn().mockResolvedValue(undefined);

// The second item's "⋯ › Arrange › <move>".
const pick = async (move: string) => {
  const [, second] = screen.getAllByRole('button', { name: 'More actions' });
  await userEvent.click(second);
  await userEvent.click(screen.getByRole('menuitem', { name: 'Arrange' }));
  await userEvent.click(screen.getByRole('menuitem', { name: move }));
};

describe('useArrange', () => {
  afterEach(() => jest.restoreAllMocks());

  it("sends the item to its neighbour's ordering", async () => {
    const reorder = resolving();
    renderItems([resolving(), reorder, resolving()]);

    await pick('Move earlier');

    expect(reorder).toHaveBeenCalledWith(2);
    expect(await screen.findByText('Order saved')).toBeInTheDocument();
  });

  it('sends the item back to its ordering on Undo', async () => {
    const reorder = resolving();
    renderItems([resolving(), reorder, resolving()]);

    await pick('Move to end');
    expect(reorder).toHaveBeenLastCalledWith(6);
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));

    expect(reorder).toHaveBeenLastCalledWith(5);
    // Undo goes away with the toast, so the focus goes back to the "⋯".
    const [, second] = screen.getAllByRole('button', { name: 'More actions' });
    expect(second).toHaveFocus();
  });

  it("says when the order couldn't be saved", async () => {
    const reorder = jest.fn().mockRejectedValue(new Error('failed'));
    renderItems([resolving(), reorder, resolving()]);

    await pick('Move later');

    await waitFor(() =>
      expect(
        screen.getByText("The order couldn't be saved. Try again.")
      ).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
  });

  it('makes room once the dragged item passes the middle of another', async () => {
    layOutAsRows();
    renderItems([resolving(), resolving(), resolving()]);

    // Coming from below, the first item's lower half isn't far enough.
    await dragOver('item-2', 'item-0', 80);
    expect(shownOrder()).toEqual(['item-0', 'item-1', 'item-2']);

    await pointAt('item-0', 20);
    expect(shownOrder()).toEqual(['item-2', 'item-0', 'item-1']);
    fireEvent.dragEnd(gripOf('item-2'));
  });

  it('saves the place the dropped item shows in', async () => {
    layOutAsRows();
    const reorder = resolving();
    renderItems([resolving(), resolving(), reorder]);

    await dragOver('item-2', 'item-0', 20);
    expect(shownOrder()).toEqual(['item-2', 'item-0', 'item-1']);

    fireEvent.drop(screen.getByTestId('item-2'));
    fireEvent.dragEnd(gripOf('item-2'));

    // It takes the place of the first item, so its ordering.
    expect(reorder).toHaveBeenCalledWith(2);
    expect(await screen.findByText('Order saved')).toBeInTheDocument();
  });

  it('puts the items back when a drag is let go elsewhere', async () => {
    const reorder = resolving();
    layOutAsRows();
    renderItems([resolving(), resolving(), reorder]);

    await dragOver('item-2', 'item-0', 20);
    expect(shownOrder()).toEqual(['item-2', 'item-0', 'item-1']);
    fireEvent.dragEnd(gripOf('item-2'));

    expect(shownOrder()).toEqual(['item-0', 'item-1', 'item-2']);
    expect(reorder).not.toHaveBeenCalled();
  });
});
