import React from 'react';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import MoreActions from '../Menu/MoreActions';
import ToastProvider from '../Toast/ToastProvider';

import useArrangeEntry from './useArrangeEntry';

interface Props {
  reorder: (ordering: number) => Promise<unknown>;
}

// The second of three items, kept at orderings 2, 5 and 6.
const Item = ({ reorder }: Props) => {
  const entries = useArrangeEntry({
    place: { orderings: [2, 5, 6], index: 1, hasMore: false },
    reorder,
  });
  return <MoreActions entries={entries} />;
};

const renderItem = (reorder: Props['reorder']) =>
  render(
    <ToastProvider>
      <Item reorder={reorder} />
    </ToastProvider>
  );

const pick = async (move: string) => {
  await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
  await userEvent.click(screen.getByRole('menuitem', { name: 'Arrange' }));
  await userEvent.click(screen.getByRole('menuitem', { name: move }));
};

describe('useArrangeEntry', () => {
  it("sends the item to its neighbour's ordering", async () => {
    const reorder = jest.fn().mockResolvedValue(undefined);
    renderItem(reorder);

    await pick('Move earlier');

    expect(reorder).toHaveBeenCalledWith(2);
    expect(await screen.findByText('Order saved')).toBeInTheDocument();
  });

  it('sends the item back to its ordering on Undo', async () => {
    const reorder = jest.fn().mockResolvedValue(undefined);
    renderItem(reorder);

    await pick('Move to end');
    expect(reorder).toHaveBeenLastCalledWith(6);
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));

    expect(reorder).toHaveBeenLastCalledWith(5);
    // Undo goes away with the toast, so the focus goes back to the "⋯".
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveFocus();
  });

  it("says when the order couldn't be saved", async () => {
    const reorder = jest.fn().mockRejectedValue(new Error('failed'));
    renderItem(reorder);

    await pick('Move later');

    await waitFor(() =>
      expect(
        screen.getByText("The order couldn't be saved. Try again.")
      ).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
  });
});
