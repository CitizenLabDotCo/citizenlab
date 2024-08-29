import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Success from '.';

describe('<Success />', () => {
  it('renders', () => {
    render(<Success text="Test Success" />);
    expect(screen.getByText('Test Success')).toBeInTheDocument();
  });
});
