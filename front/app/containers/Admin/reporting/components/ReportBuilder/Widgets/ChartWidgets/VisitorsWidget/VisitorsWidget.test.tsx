import React from 'react';
import VisitorsWidget from '.';
import Editor from '../../../Editor';
import { render, screen } from 'utils/testUtils/rtl';

let mockVisitors: any = null;
jest.mock('components/admin/GraphCards/VisitorsCard/useVisitors', () =>
  jest.fn(() => mockVisitors)
);

describe.skip('<VisitorsWidget />', () => {
  const startAt = undefined;
  const endAt = undefined;
  const projectId = undefined;
  const title = { en: 'VISITORS TITLE' };

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

    mockVisitors = {
      currentResolution: 'month',
      stats: validStats,
      timeSeries: validTimeSeries,
    };

    const { container } = render(
      <Editor isPreview={false} onNodesChange={() => {}}>
        <VisitorsWidget
          startAt={startAt}
          endAt={endAt}
          projectId={projectId}
          title={title}
        />
      </Editor>
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

    mockVisitors = {
      currentResolution: 'month',
      stats: emptyStats,
      timeSeries: emptyTimeSeries,
    };

    const { container } = render(
      <VisitorsWidget
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
