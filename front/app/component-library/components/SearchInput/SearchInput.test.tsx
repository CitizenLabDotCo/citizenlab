import React from 'react';

import { fireEvent, render, screen } from '../../utils/testUtils/rtl';

import SearchInput from '.';

describe('<SearchInput />', () => {
  it('renders', () => {
    const handleOnChange = jest.fn();

    render(
      <SearchInput
        id="testid"
        placeholder="Test SearchInput"
        ariaLabel="Search input"
        a11y_closeIconTitle="Close"
        onChange={handleOnChange}
      />
    );
    expect(screen.getByTestId('input-field')).toBeInTheDocument();
  });

  describe('controlled', () => {
    const renderControlled = (value: string | null) => (
      <SearchInput
        value={value}
        placeholder="Test SearchInput"
        ariaLabel="Search input"
        a11y_closeIconTitle="Close"
        onChange={jest.fn()}
      />
    );

    it('follows changes to the value', () => {
      const { rerender } = render(renderControlled('park'));
      expect(screen.getByRole('searchbox')).toHaveValue('park');

      rerender(renderControlled(null));
      expect(screen.getByRole('searchbox')).toHaveValue('');

      rerender(renderControlled('square'));
      expect(screen.getByRole('searchbox')).toHaveValue('square');
    });

    it('shows typed text before the value is updated', () => {
      const { rerender } = render(renderControlled(null));

      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'par' },
      });
      rerender(renderControlled(null));

      expect(screen.getByRole('searchbox')).toHaveValue('par');
    });
  });
});
