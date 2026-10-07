import React from 'react';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import TagPicker from './index';

const options = [
  { value: 'mobility', label: 'Mobility' },
  { value: 'climate', label: 'Climate' },
  { value: 'parking', label: 'Parking' },
];

describe('TagPicker', () => {
  it('shows a chip for each selected tag', () => {
    render(
      <TagPicker
        options={options}
        selected={['mobility', 'climate']}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Mobility')).toBeInTheDocument();
    expect(screen.getByText('Climate')).toBeInTheDocument();
    expect(screen.queryByText('Parking')).not.toBeInTheDocument();
  });

  it('removes a tag from its chip', async () => {
    const onChange = jest.fn();
    render(
      <TagPicker
        options={options}
        selected={['mobility', 'climate']}
        onChange={onChange}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Mobility' })
    );

    expect(onChange).toHaveBeenCalledWith(['climate']);
  });

  it('adds a tag from the popover', async () => {
    const onChange = jest.fn();
    render(
      <TagPicker
        options={options}
        selected={['mobility']}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
    await userEvent.click(screen.getByText('Parking'));

    expect(onChange).toHaveBeenCalledWith(['mobility', 'parking']);
  });

  it('filters the list by search and shows an empty state', async () => {
    render(<TagPicker options={options} selected={[]} onChange={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
    const search = screen.getByRole('searchbox');

    await userEvent.type(search, 'cli');
    await waitFor(() =>
      expect(screen.queryByText('Parking')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Climate')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(
      await screen.findByText('No tags match your search.')
    ).toBeInTheDocument();
  });

  it('counts the selection and closes on Done', async () => {
    render(
      <TagPicker
        options={options}
        selected={['mobility', 'climate']}
        onChange={jest.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
    expect(screen.getByText('2 tags selected')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
