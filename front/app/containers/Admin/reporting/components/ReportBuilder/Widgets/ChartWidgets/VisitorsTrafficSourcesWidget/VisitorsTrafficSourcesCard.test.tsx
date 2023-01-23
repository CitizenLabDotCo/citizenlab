import React from 'react';
import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';
import { render } from 'utils/testUtils/rtl';
import useVisitorReferrerTypes from 'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes';

jest.mock(
  'components/admin/GraphCards/VisitorsTrafficSourcesCard/useVisitorReferrerTypes',
  () => jest.fn()
);
jest.mock('containers/Admin/reporting/hooks/useNarrow', () => () => true);

describe('<VisitorsTrafficSourcesCard />', () => {
  const startAtMoment = null;
  const endAtMoment = null;
  const projectId = undefined;
  const title = 'TRAFFIC SOURCES TITLE';

  it('renders a title and a pie chart if there is data', () => {
    const validData = [
      { name: 'Campaigns', value: 1, percentage: 50, color: '#2F478A' },
      { name: 'Direct', value: 1, percentage: 50, color: '#8A472F' },
    ];

    // @ts-ignore
    useVisitorReferrerTypes.mockReturnValue({ pieData: validData });

    const { container } = render(
      <VisitorsTrafficSourcesCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
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
    // @ts-ignore
    useVisitorReferrerTypes.mockReturnValue({ pieData: null });

    const { container } = render(
      <VisitorsTrafficSourcesCard
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
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
