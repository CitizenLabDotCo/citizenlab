import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Badge from '.';

describe('<Badge />', () => {
  it('renders', () => {
    render(<Badge>Test badge</Badge>);
    expect(screen.getByText('Test badge')).toBeInTheDocument();
  });
});
