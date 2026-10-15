import React from 'react';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import MoreActions from '../Menu/MoreActions';
import ToastProvider from '../Toast/ToastProvider';

import { Placement } from './destinations';
import useMoveToEntry from './useMoveToEntry';

jest.mock('utils/permissions', () => ({ usePermission: () => true }));
jest.mock('hooks/useFeatureFlag', () => () => true);
jest.mock('api/spaces/useSpaces', () => () => ({
  isLoading: false,
  data: {
    data: [
      { id: 's1', attributes: { title_multiloc: { en: 'Mobility' } } },
      { id: 's2', attributes: { title_multiloc: { en: 'Climate' } } },
    ],
  },
}));
jest.mock(
  'api/project_folders_mini/useInfiniteProjectFoldersAdmin',
  () => () => ({
    isLoading: false,
    data: {
      pages: [
        {
          data: [
            {
              id: 'f1',
              attributes: {
                title_multiloc: { en: 'Bikes' },
                space_id: 's1',
              },
            },
          ],
        },
      ],
    },
  })
);

// A project in the Bikes folder, in the Mobility space.
const here: Placement = { folder_id: 'f1', space_id: 's1' };

interface Props {
  move: (placement: Placement) => Promise<unknown>;
}

const Project = ({ move }: Props) => {
  const entries = useMoveToEntry({ item: 'project', here, move });
  return <MoreActions entries={entries} />;
};

const renderProject = (move: Props['move']) =>
  render(
    <ToastProvider>
      <Project move={move} />
    </ToastProvider>
  );

const openMoveTo = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
  await userEvent.click(screen.getByRole('menuitem', { name: 'Move to' }));
};

describe('useMoveToEntry', () => {
  it('lists where the project can go, marking where it is', async () => {
    renderProject(jest.fn());
    await openMoveTo();

    const destinations = screen.getAllByRole('menuitem').slice(1);
    expect(destinations.map((row) => row.textContent)).toEqual([
      'Mobility',
      'BikesMobility',
      'Climate',
      'No space',
    ]);
    expect(destinations[1]).toHaveAttribute('aria-current', 'true');
    expect(destinations[1]).toHaveAttribute('aria-disabled', 'true');
  });

  it('moves the project, and back on Undo', async () => {
    const move = jest.fn().mockResolvedValue(undefined);
    renderProject(move);
    await openMoveTo();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Climate' }));
    expect(move).toHaveBeenCalledWith({ folder_id: null, space_id: 's2' });
    expect(await screen.findByText('Moved to Climate')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(move).toHaveBeenLastCalledWith(here);
  });

  it('says the project left its folder when it leaves everything', async () => {
    renderProject(jest.fn().mockResolvedValue(undefined));
    await openMoveTo();

    await userEvent.click(screen.getByRole('menuitem', { name: 'No space' }));
    expect(
      await screen.findByText('Moved out of its folder')
    ).toBeInTheDocument();
  });

  it("says when the move couldn't be saved", async () => {
    renderProject(jest.fn().mockRejectedValue(new Error('failed')));
    await openMoveTo();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Climate' }));
    await waitFor(() =>
      expect(
        screen.getByText("The move couldn't be saved. Try again.")
      ).toBeInTheDocument()
    );
  });
});
