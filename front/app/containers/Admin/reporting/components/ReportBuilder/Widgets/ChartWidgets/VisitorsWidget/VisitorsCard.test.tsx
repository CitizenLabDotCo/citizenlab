import React from 'react';
import VisitorsCard from './VisitorsCard';
import { render, screen } from 'utils/testUtils/rtl';
import useVisitors from 'components/admin/GraphCards/VisitorsCard/useVisitors';

jest.mock('components/admin/GraphCards/VisitorsCard/useVisitors', () =>
  jest.fn()
);

describe('<VisitorsCard />', () => {
  const startAtMoment = null;
  const endAtMoment = null;
  const projectId = undefined;
  const resolution = 'month';
  const title = 'VISITORS TITLE';

  it('renders a title, line graph and stats box when there is data', () => {
    const validStats = {
      visitors: {
        value: '100',
        lastPeriod: '10',
      },
      visits: {
        value: '150',
        lastPeriod: '15',
      },
    };

    const validTimeSeries = [
      { date: '2022-08-01', visitors: 100, visits: 100 },
      { date: '2022-09-01', visitors: 100, visits: 100 },
      { date: '2022-10-01', visitors: 100, visits: 100 },
    ];

    // @ts-ignore
    useVisitors.mockReturnValue({
      currentResolution: 'month',
      stats: validStats,
      timeSeries: validTimeSeries,
    });

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
  });

  it('renders a title and no data message if all values are zero', () => {
    const emptyStats = {
      visitors: {
        value: '0',
        lastPeriod: '0',
      },
      visits: {
        value: '0',
        lastPeriod: '0',
      },
    };

    const emptyTimeSeries = [
      { date: '2022-08-01', visitors: 0, visits: 0 },
      { date: '2022-09-01', visitors: 0, visits: 0 },
      { date: '2022-10-01', visitors: 0, visits: 0 },
    ];

    // @ts-ignore
    useVisitors.mockReturnValue({
      currentResolution: 'month',
      stats: emptyStats,
      timeSeries: emptyTimeSeries,
    });

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

    // Empty data
    expect(container.querySelector('.no-chart-data')).toBeInTheDocument();
  });
});
