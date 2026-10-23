import React from 'react';

import { fireEvent, render, screen } from '../../utils/testUtils/rtl';

import OptionList from '.';

const options = [
  { value: 'new', label: 'New', count: 12 },
  { value: 'review', label: 'Under review' },
  { value: 'locked', label: 'Locked', disabled: true },
];

const strings = {
  searchPlaceholder: 'Filter',
  noMatchesText: 'Nothing matches your search',
};

const manyOptions = Array.from({ length: 9 }, (_, i) => ({
  value: `o${i}`,
  label: `Option ${i}`,
}));

describe('<OptionList />', () => {
  it('renders one checkable item per option with its count', () => {
    render(
      <OptionList
        {...strings}
        options={options}
        selected={['review']}
        onToggle={jest.fn()}
      />
    );
    const items = screen.getAllByRole('menuitemcheckbox');
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(items[2]).toBeDisabled();
  });

  it('calls onToggle with the option value', () => {
    const onToggle = jest.fn();
    render(
      <OptionList
        {...strings}
        options={options}
        selected={[]}
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getAllByRole('menuitemcheckbox')[0]);
    expect(onToggle).toHaveBeenCalledWith('new');
  });

  it('shows no search field below nine options', () => {
    render(
      <OptionList
        {...strings}
        options={options}
        selected={[]}
        onToggle={jest.fn()}
      />
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('filters from nine options on and says when nothing matches', () => {
    render(
      <OptionList
        {...strings}
        options={manyOptions}
        selected={[]}
        onToggle={jest.fn()}
      />
    );
    const search = screen.getByRole('textbox');
    fireEvent.change(search, { target: { value: 'option 3' } });
    expect(screen.getAllByRole('menuitemcheckbox')).toHaveLength(1);
    fireEvent.change(search, { target: { value: 'zzz' } });
    expect(screen.queryByRole('menuitemcheckbox')).not.toBeInTheDocument();
    expect(screen.getByText(strings.noMatchesText)).toBeInTheDocument();
  });
});
