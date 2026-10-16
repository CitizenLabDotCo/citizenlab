import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import ArrangeFlyout from '../Arrange/ArrangeFlyout';

import { MenuEntry } from './FlyoutMenu';
import MoreActions from './MoreActions';

const onEdit = jest.fn();
const onPick = jest.fn();

const entries: MenuEntry[] = [
  { key: 'edit', icon: 'edit', label: 'Edit', onSelect: onEdit },
  {
    key: 'arrange',
    icon: 'sort',
    label: 'Arrange',
    flyout: (takeFocus, close) => (
      <ArrangeFlyout
        moves={['start', 'end']}
        takeFocus={takeFocus}
        onPick={(move) => {
          onPick(move);
          close();
        }}
      />
    ),
  },
  { key: 'delete', icon: 'delete', label: 'Delete', onSelect: jest.fn() },
];

const item = (name: string) => screen.getByRole('menuitem', { name });

const openFromKeyboard = async () => {
  render(<MoreActions entries={entries} />);
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
};

describe('MoreActions', () => {
  beforeEach(() => {
    onEdit.mockClear();
    onPick.mockClear();
  });

  it('gives the first item the focus when opened from the keyboard', async () => {
    await openFromKeyboard();

    expect(item('Edit')).toHaveFocus();
  });

  it('leaves the focus on the button when opened with a click', async () => {
    render(<MoreActions entries={entries} />);
    const button = screen.getByRole('button', { name: 'More actions' });
    await userEvent.click(button);

    expect(item('Edit')).toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('moves through the items with the arrow keys, Home and End', async () => {
    await openFromKeyboard();

    await userEvent.keyboard('{ArrowDown}');
    expect(item('Arrange')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(item('Edit')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(item('Delete')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(item('Edit')).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(item('Delete')).toHaveFocus();
  });

  it('opens a flyout with the arrow towards it, and comes back with the other', async () => {
    await openFromKeyboard();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');

    expect(item('Move to start')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Move to end')).toHaveFocus();

    await userEvent.keyboard('{ArrowLeft}');
    expect(item('Arrange')).toHaveFocus();
    expect(
      screen.queryByRole('menuitem', { name: 'Move to start' })
    ).not.toBeInTheDocument();
  });

  it('opens a flyout from Enter, its first choice taking the focus', async () => {
    await openFromKeyboard();
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(item('Move to start')).toHaveFocus();
  });

  it('gives the focus to a hovered row when the flyout that had it closes', async () => {
    await openFromKeyboard();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    expect(item('Move to start')).toHaveFocus();

    await userEvent.hover(item('Delete'));

    expect(item('Delete')).toHaveFocus();
  });

  it('closes on Escape and gives the focus back to the button', async () => {
    await openFromKeyboard();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveFocus();
  });

  it('gives the focus back to the button once a choice is picked', async () => {
    await openFromKeyboard();
    await userEvent.keyboard('{Enter}');

    expect(onEdit).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveFocus();
  });

  it('acts on a flyout choice picked from the keyboard', async () => {
    await openFromKeyboard();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{ArrowDown}{Enter}');

    expect(onPick).toHaveBeenCalledWith('end');
    expect(screen.getByRole('button', { name: 'More actions' })).toHaveFocus();
  });
});
