import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import VisitorsCard from '.';

const mockStats = {
  visitors: {
    value: '100',
    lastPeriod: '10',
  },
  visits: {
    value: '150',
    lastPeriod: '15',
  },
  visitDuration: {
    value: '00:02:10',
    lastPeriod: '00:01:55',
  },
  pageViews: {
    value: '3.1',
    lastPeriod: '2.8',
  },
};

const mockTimeSeries = [
  { date: '2022-08-01', visitors: 100, visits: 100 },
  { date: '2022-09-01', visitors: 100, visits: 100 },
  { date: '2022-10-01', visitors: 100, visits: 100 },
];

jest.mock('./useVisitors', () => () => ({
  currentResolution: 'month',
  stats: mockStats,
  timeSeries: mockTimeSeries,
  xlsxData: {},
}));

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

// @ts-ignore
window.ResizeObserver = FakeResizeObserver;

describe('<VisitorsCard />', () => {
  const startAtMoment = null;
  const endAtMoment = null;
  const resolution = 'month';

  it('renders graph', () => {
    const { container } = render(
      <VisitorsCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        resolution={resolution}
      />
    );

    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();
  });

  it('renders visit duration and pageviews', () => {
    render(
      <VisitorsCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        resolution={resolution}
      />
    );

    expect(screen.getByText('00:02:10')).toBeInTheDocument();
    expect(screen.getByText('00:01:55')).toBeInTheDocument();
    expect(screen.getByText('3.1')).toBeInTheDocument();
    expect(screen.getByText('2.8')).toBeInTheDocument();
  });
});
