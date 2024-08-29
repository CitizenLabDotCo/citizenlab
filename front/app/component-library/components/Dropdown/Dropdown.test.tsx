import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Dropdown from '.';

describe('<Dropdown />', () => {
  it('renders content when opened', () => {
    render(<Dropdown opened={true} content={<div>Test dropdown</div>} />);
    expect(screen.getByText('Test dropdown')).toBeInTheDocument();
  });

  it('does not render content when not opened', () => {
    render(<Dropdown opened={false} content={<div>Test dropdown</div>} />);
    expect(screen.queryByText('Test dropdown')).not.toBeInTheDocument();
  });

  it('defaults to z-index of 5', () => {
    const result = render(
      <Dropdown
        id="default-zindex"
        opened={true}
        content={<div>Test dropdown</div>}
      />
    );
    const dropdown = result.container.querySelector('#default-zindex');
    expect(dropdown).toHaveStyle({ zIndex: 5 });
  });

  it('uses the value of the zIndex prop when supplied', () => {
    const result = render(
      <Dropdown
        id="prop-zindex"
        opened={true}
        content={<div>Test dropdown</div>}
        zIndex="100"
      />
    );
    const dropdown = result.container.querySelector('#prop-zindex');
    expect(dropdown).toHaveStyle({ zIndex: 100 });
  });
});
