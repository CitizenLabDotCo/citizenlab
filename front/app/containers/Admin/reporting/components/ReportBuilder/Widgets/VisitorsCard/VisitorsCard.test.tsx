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
};

const mockTimeSeries = [
  { date: '2022-08-01', visitors: 100, visits: 100 },
  { date: '2022-09-01', visitors: 100, visits: 100 },
  { date: '2022-10-01', visitors: 100, visits: 100 },
];

jest.mock('components/admin/GraphCards/VisitorsCard/useVisitors', () => () => ({
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
  it('renders a title, line graph and stats box', () => {
    const startAtMoment = null;
    const endAtMoment = null;
    const projectId = undefined;
    const resolution = 'month';
    const title = 'VISITORS TITLE';

    const { container } = render(
      <VisitorsCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        projectId={projectId}
        resolution={resolution}
        title={title}
      />
    );

    // Title
    expect(container.querySelector('h3').innerHTML).toBe(title);

    // Line graph
    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();

    // Stats box
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();

    // Be nice to check the SVG, but can't yet get the querySelector to work
    // const graphContainer = container.querySelector('.recharts-responsive-container');
    // expect(graphContainer.querySelector('.recharts-line')).toBeInTheDocument();
  });
});
