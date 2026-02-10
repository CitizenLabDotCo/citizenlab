import React from 'react';

import { RouteType } from 'routes';

import { render, screen } from 'utils/testUtils/rtl';

import TabbedResource from '.';

const children = (
  <>
    <div>Child Content</div>
  </>
);

const fakeTabs = [
  {
    name: 'FirstTab',
    label: 'First Tab',
    url: '/first' as RouteType,
  },
  {
    name: 'SecondTab',
    label: 'Second Tab',
    url: '/second' as RouteType,
  },
  {
    name: 'ThirdTab',
    label: 'Third Tab',
    url: '/third' as RouteType,
    active: true,
  },
];

const fakeResource = {
  title: 'Tab page',
  subtitle: 'Fake Tab Page',
};

describe('<TabbedResource />', () => {
  it('renders tabs and header properly including an active tab', () => {
    const { container } = render(
      <TabbedResource resource={fakeResource} tabs={fakeTabs}>
        {children}
      </TabbedResource>
    );

    expect(container.getElementsByClassName('active')).toHaveLength(1);
    expect(screen.getByText('Third Tab')).toBeInTheDocument();
    expect(screen.getByText('Tab page')).toBeInTheDocument();
    expect(screen.getByText('Fake Tab Page')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders properly with an optional status label', () => {
    const tabsIncludingOneWithStatusLabel = [
      ...fakeTabs,
      {
        name: 'FourthTab',
        label: 'Fourth Tab',
        url: '/fourth' as RouteType,
        statusLabel: 'Beta Tag',
      },
    ];

    render(
      <TabbedResource
        resource={fakeResource}
        tabs={tabsIncludingOneWithStatusLabel}
      >
        {children}
      </TabbedResource>
    );
    expect(screen.getByText('Beta Tag')).toBeInTheDocument();
  });
});
