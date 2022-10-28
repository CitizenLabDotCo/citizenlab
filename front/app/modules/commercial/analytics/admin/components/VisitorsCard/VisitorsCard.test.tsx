import React from 'react';
import VisitorsCard from '.';
import { render, screen } from 'utils/testUtils/rtl';

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

jest.mock('../../hooks/useVisitors', () => () => ({
  deducedResolution: 'month',
  stats: mockStats,
  timeSeries: mockTimeSeries,
  xlsxData: {},
}));

jest.mock('services/appConfiguration');
jest.mock('services/locale');
jest.mock('utils/cl-intl');

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
    const projectId = undefined;

    const { container } = render(
      <VisitorsCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        projectId={projectId}
        resolution={resolution}
      />
    );

    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();
  });

  it('renders visit duration and pageviews', () => {
    const projectId = undefined;

    render(
      <VisitorsCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        projectId={projectId}
        resolution={resolution}
      />
    );

    expect(screen.getByText('00:02:10')).toBeInTheDocument();
    expect(screen.getByText('00:01:55')).toBeInTheDocument();
    expect(screen.getByText('3.1')).toBeInTheDocument();
    expect(screen.getByText('2.8')).toBeInTheDocument();
  });

  it('does not render tooltips for duration and pageviews if project filter not active', () => {
    const projectId = undefined;

    const { container } = render(
      <VisitorsCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        projectId={projectId}
        resolution={resolution}
      />
    );

    expect(container.querySelectorAll('.tooltip-icon')).toHaveLength(3);
  });

  it('renders tooltips for duration and pageviews if project filter active', () => {
    const projectId = '1111';

    const { container } = render(
      <VisitorsCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        projectId={projectId}
        resolution={resolution}
      />
    );

    expect(container.querySelectorAll('.tooltip-icon')).toHaveLength(5);
  });
});
