import React from 'react';
import ActiveUsersWidget from '.';
import { render, screen } from 'utils/testUtils/rtl';

let mockActiveUsers: any = null;
jest.mock('components/admin/GraphCards/ActiveUsersCard/useActiveUsers', () =>
  jest.fn(() => mockActiveUsers)
);

describe.skip('<ActiveUsersWidget />', () => {
  const startAt = undefined;
  const endAt = undefined;
  const projectId = undefined;
  const title = { en: 'PARTICIPANTS TITLE' };

  it('renders a title, line graph and stats box when there is data', () => {
    const validStats = {
      activeUsers: {
        value: '3',
        lastPeriod: '3',
      },
    };

    const validTimeSeries = [
      { date: '2022-10-01', activeUsers: 1 },
      { date: '2022-11-01', activeUsers: 3 },
      { date: '2022-12-01', activeUsers: 3 },
    ];

    mockActiveUsers = {
      currentResolution: 'month',
      stats: validStats,
      timeSeries: validTimeSeries,
    };

    const { container } = render(
      <ActiveUsersWidget
        startAt={startAt}
        endAt={endAt}
        projectId={projectId}
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
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders a title and no data message if all values are zero', () => {
    const emptyStats = {
      activeUsers: {
        value: '0',
        lastPeriod: '0',
      },
    };

    const emptyTimeSeries = [
      { date: '2022-10-01', activeUsers: 0 },
      { date: '2022-11-01', activeUsers: 0 },
      { date: '2022-12-01', activeUsers: 0 },
    ];

    mockActiveUsers = {
      currentResolution: 'month',
      stats: emptyStats,
      timeSeries: emptyTimeSeries,
    };

    const { container } = render(
      <ActiveUsersWidget
        startAt={startAt}
        endAt={endAt}
        projectId={projectId}
        title={title}
      />
    );

    // Title
    expect(container.querySelector('h3').innerHTML).toBe(title);

    // Empty data
    expect(container.querySelector('.no-chart-data')).toBeInTheDocument();
  });
});
