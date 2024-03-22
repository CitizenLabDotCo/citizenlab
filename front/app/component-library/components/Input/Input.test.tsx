import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Input from '.';

describe('<Input />', () => {
  it('renders', () => {
    render(<Input type="text" value="Test Input" />);
    expect(screen.getByDisplayValue('Test Input')).toBeInTheDocument();
  });
});
