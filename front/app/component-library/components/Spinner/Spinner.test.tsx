import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Spinner from '.';

describe('<Spinner />', () => {
  it('renders', () => {
    render(<Spinner />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
