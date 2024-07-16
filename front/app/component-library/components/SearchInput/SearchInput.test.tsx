import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

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
});
