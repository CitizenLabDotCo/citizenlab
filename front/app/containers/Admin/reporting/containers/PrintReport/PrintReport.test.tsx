import React from 'react';
import PrintReport from './';
import { render } from 'utils/testUtils/rtl';
import { reportLayout } from 'api/report_layout/__mocks__/_mockServer';

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

const mockReportLayout = JSON.parse(JSON.stringify(reportLayout));

jest.mock('api/report_layout/useReportLayout', () =>
  jest.fn(() => ({ data: mockReportLayout }))
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({
    pathname: 'admin/reporting/report-builder/r1/editor',
  })),
  useParams: jest.fn(() => ({ reportId: 'r1' })),
}));

jest.mock('api/reports/useReport', () =>
  jest.fn(() => ({
    data: { data: { relationships: { phase: { data: { id: 'ph1' } } } } },
  }))
);

jest.mock('api/phases/usePhase', () =>
  jest.fn(() => ({
    data: { data: { relationships: { project: { data: { id: 'pr1' } } } } },
  }))
);

jest.mock(
  'components/admin/ContentBuilder/FullscreenPreview/Wrapper',
  () =>
    ({ children }) =>
      <>{children}</>
);

describe('<FullscreenReport />', () => {
  // I used this test to debug an issue (https://www.notion.so/Closing-the-Loop-II-Report-builder-Improvements-c87635531bb24f05ae2ffd39171a7b04?p=864d29a558f1406aafc78e6809669354&pm=s)
  // Turns out the issue was that one of the nodes in the mockReportLayout
  // had a `resolvedName` that didn't match any of the components in the resolver.
  // This was because of a small bug in a migration script
  // (back/engines/commercial/multi_tenancy/lib/tasks/core/migrate_craftjson.rake).
  // In the mock data above, I fixed the `resolvedName` of the mismatched node.
  // Now the test passes.
  it('renders if report layout is valid', () => {
    const { container } = render(<PrintReport />);
    expect(
      container.querySelector('#e2e-content-builder-frame')
    ).toBeInTheDocument();
  });
});
