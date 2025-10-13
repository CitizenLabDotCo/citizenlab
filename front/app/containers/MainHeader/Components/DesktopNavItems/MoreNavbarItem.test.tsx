import React from 'react';

import { RouteType } from 'routes';

import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import MoreNavbarItem from './MoreNavbarItem';

const mockOverflowItems = [
  {
    linkTo: '/test1' as RouteType,
    navigationItemTitle: { en: 'Test Item 1' },
    onlyActiveOnIndex: false,
  },
  {
    linkTo: '/test2' as RouteType,
    navigationItemTitle: { en: 'Test Item 2' },
    onlyActiveOnIndex: false,
  },
];

describe('<MoreNavbarItem />', () => {
  it('renders nothing when no overflow items', () => {
    const { container } = render(<MoreNavbarItem overflowItems={[]} />);
    // The component should not render anything when there are no overflow items
    expect(container.querySelector('li')).toBeNull();
  });

  it('renders More button when overflow items exist', () => {
    render(<MoreNavbarItem overflowItems={mockOverflowItems} />);
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('shows dropdown when More button is clicked', () => {
    render(<MoreNavbarItem overflowItems={mockOverflowItems} />);

    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  it('hides dropdown when clicking outside', () => {
    render(<MoreNavbarItem overflowItems={mockOverflowItems} />);

    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();

    // Click outside the dropdown
    fireEvent.click(document.body);

    expect(screen.queryByText('Test Item 1')).not.toBeInTheDocument();
  });
});
