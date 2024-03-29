import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Error from '.';

describe('<Error />', () => {
  it('renders', () => {
    render(<Error text="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
