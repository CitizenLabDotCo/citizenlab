import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Icon from '.';

describe('<Icon />', () => {
  it('renders', () => {
    render(<Icon name="close" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
