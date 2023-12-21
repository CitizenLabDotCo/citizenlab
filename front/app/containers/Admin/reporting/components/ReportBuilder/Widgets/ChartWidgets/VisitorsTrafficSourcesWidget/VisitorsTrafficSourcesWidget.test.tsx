import React from 'react';
import VisitorsTrafficSourcesWidget from '.';
import { render } from 'utils/testUtils/rtl';

let mockVisitorReferrerTypes: any = { pieData: null };
jest.mock(
  'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes',
  () => jest.fn(() => mockVisitorReferrerTypes)
);
jest.mock('containers/Admin/reporting/hooks/useLayout', () => () => 'narrow');

describe.skip('<VisitorsTrafficSourcesWidget />', () => {
  const startAt = undefined;
  const endAt = undefined;
  const projectId = undefined;
  const title = { en: 'TRAFFIC SOURCES TITLE' };

  it('renders a title and a pie chart if there is data', () => {
    const validData = [
      { name: 'Campaigns', value: 1, percentage: 50, color: '#2F478A' },
      { name: 'Direct', value: 1, percentage: 50, color: '#8A472F' },
    ];

    mockVisitorReferrerTypes = { pieData: validData };

    const { container } = render(
      <VisitorsTrafficSourcesWidget
        startAt={startAt}
        endAt={endAt}
        projectId={projectId}
        title={title}
      />
    );

    // Title
    expect(container.querySelector('h3').innerHTML).toBe(title);

    // Pie chart
    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();
  });

  it('renders a title and no data message if there is no data', () => {
    mockVisitorReferrerTypes = { pieData: null };

    const { container } = render(
      <VisitorsTrafficSourcesWidget
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
