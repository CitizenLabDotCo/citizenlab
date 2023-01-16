import React from 'react';
import ActiveUsersCard from './ActiveUsersCard';
import { render, screen } from 'utils/testUtils/rtl';
import useActiveUsers from 'components/admin/GraphCards/ActiveUsersCard/useActiveUsers';

jest.mock('components/admin/GraphCards/ActiveUsersCard/useActiveUsers', () =>
  jest.fn()
);

describe('<ActiveUsersCard />', () => {
  const startAtMoment = null;
  const endAtMoment = null;
  const projectId = undefined;
  const resolution = 'month';
  const title = 'PARTICIPANTS TITLE';

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

    // @ts-ignore
    useActiveUsers.mockReturnValue({
      currentResolution: 'month',
      stats: validStats,
      timeSeries: validTimeSeries,
    });

    const { container } = render(
      <ActiveUsersCard
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

    // @ts-ignore
    useActiveUsers.mockReturnValue({
      currentResolution: 'month',
      stats: emptyStats,
      timeSeries: emptyTimeSeries,
    });

    const { container } = render(
      <ActiveUsersCard
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
