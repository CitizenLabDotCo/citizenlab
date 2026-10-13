import React from 'react';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import PillPicker from './index';

const options = [
  { value: 'mobility', label: 'Mobility' },
  { value: 'climate', label: 'Climate' },
  { value: 'parking', label: 'Parking' },
];

const labels = {
  addLabel: 'Choose groups',
  searchPlaceholder: 'Search groups',
  noMatchLabel: 'No groups match your search.',
};

describe('PillPicker', () => {
  it('shows a pill for each selected option', () => {
    render(
      <PillPicker
        options={options}
        selected={['mobility', 'climate']}
        onChange={jest.fn()}
        {...labels}
      />
    );

    expect(screen.getByText('Mobility')).toBeInTheDocument();
    expect(screen.getByText('Climate')).toBeInTheDocument();
    expect(screen.queryByText('Parking')).not.toBeInTheDocument();
  });

  it('removes an option from its pill', async () => {
    const onChange = jest.fn();
    render(
      <PillPicker
        options={options}
        selected={['mobility', 'climate']}
        onChange={onChange}
        {...labels}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Mobility' })
    );

    expect(onChange).toHaveBeenCalledWith(['climate']);
  });

  it('adds an option from the popover', async () => {
    const onChange = jest.fn();
    render(
      <PillPicker
        options={options}
        selected={['mobility']}
        onChange={onChange}
        {...labels}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Choose groups' })
    );
    await userEvent.click(screen.getByText('Parking'));

    expect(onChange).toHaveBeenCalledWith(['mobility', 'parking']);
  });

  it('filters the list by search and shows an empty state', async () => {
    render(
      <PillPicker
        options={options}
        selected={[]}
        onChange={jest.fn()}
        {...labels}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Choose groups' })
    );
    const search = screen.getByRole('searchbox');
    expect(search).toHaveAttribute('placeholder', 'Search groups');

    await userEvent.type(search, 'cli');
    await waitFor(() =>
      expect(screen.queryByText('Parking')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Climate')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(
      await screen.findByText('No groups match your search.')
    ).toBeInTheDocument();
  });

  it('counts the selection and closes on Done', async () => {
    render(
      <PillPicker
        options={options}
        selected={['mobility', 'climate']}
        onChange={jest.fn()}
        {...labels}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Choose groups' })
    );
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
