import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Label from '.';

describe('<Label />', () => {
  it('renders', () => {
    render(<Label>Test label</Label>);
    expect(screen.getByText('Test label')).toBeInTheDocument();
  });
});
