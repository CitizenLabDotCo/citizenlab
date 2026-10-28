import React from 'react';

import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import SingleSelectFilter from './SingleSelectFilter';

const options = [
  { id: 'parks', label: 'Parks', count: 3 },
  { id: 'mobility', label: 'Mobility', count: 5 },
];

const renderFilter = (
  selectedId: string | null = null,
  onChange = jest.fn()
) => {
  render(
    <SingleSelectFilter
      title="Theme"
      options={options}
      totalCount={9}
      selectedId={selectedId}
      onChange={onChange}
    />
  );
  return onChange;
};

describe('SingleSelectFilter', () => {
  it('shows every option and the total with their counts', () => {
    renderFilter();

    expect(screen.getByRole('button', { name: /^all/i })).toHaveTextContent(
      '9'
    );
    expect(screen.getByRole('button', { name: /parks/i })).toHaveTextContent(
      '3'
    );
    expect(screen.getByRole('button', { name: /mobility/i })).toHaveTextContent(
      '5'
    );
  });

  it('reports the clicked option', () => {
    const onChange = renderFilter();

    fireEvent.click(screen.getByRole('button', { name: /parks/i }));

    expect(onChange).toHaveBeenCalledWith('parks');
  });

  it('clears the selection when the selected option is clicked again', () => {
    const onChange = renderFilter('parks');

    fireEvent.click(screen.getByRole('button', { name: /parks/i }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('clears the selection from the all row', () => {
    const onChange = renderFilter('parks');

    fireEvent.click(screen.getByRole('button', { name: /^all/i }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
