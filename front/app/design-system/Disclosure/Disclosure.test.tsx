import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import Menu, { MenuItem } from '../Menu';

import Disclosure from '.';

describe('Disclosure', () => {
  it('puts its trigger inside a heading', () => {
    render(<Disclosure title="Dates">Body</Disclosure>);

    const heading = screen.getByRole('heading', { name: 'Dates' });

    expect(
      screen.getByRole('button', { name: 'Dates', expanded: false })
    ).toBeInTheDocument();
    expect(heading).toContainElement(screen.getByRole('button'));
  });
});

it('shows the tooltip on keyboard focus and still expands on enter', async () => {
  const user = userEvent.setup();

  render(
    <Disclosure title="Set area" tooltip="Choose where the project applies.">
      <p>Selected areas</p>
    </Disclosure>
  );

  await user.tab();
  const trigger = screen.getByRole('button', { name: 'Set area' });
  expect(trigger).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Choose where the project applies.'
  );

  await user.keyboard('{Enter}');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Selected areas')).toBeVisible();
});

it('opens its menu from the header', async () => {
  const user = userEvent.setup();
  const onAction = jest.fn();

  render(
    <Disclosure
      header="menu"
      title="Sorting"
      menu={
        <Menu aria-label="Sorting" onAction={onAction}>
          <MenuItem id="trending">Trending</MenuItem>
          <MenuItem id="new">Most recent</MenuItem>
        </Menu>
      }
    />
  );

  await user.click(screen.getByRole('button', { name: 'Sorting' }));
  await user.click(screen.getByRole('menuitem', { name: 'Most recent' }));

  expect(onAction).toHaveBeenCalledWith('new');
});
