import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ReportBuilder from '.';

// service mocks
jest.mock('services/appConfiguration');
jest.mock('services/locale');

// hook mocks
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

let mockReportLayout;
jest.mock('hooks/useReportLayout', () => jest.fn(() => mockReportLayout));
jest.mock('hooks/useReport', () =>
  jest.fn(() => ({
    attributes: { name: 'Report 1' },
  }))
);

// const reportLayout = {} // TODO

// other mocks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({
    pathname: 'admin/reporting/report-builder/r1/editor',
  })),
  useParams: jest.fn(() => ({ reportId: 'r1' })),
}));

describe('<ReportBuilder />', () => {
  it('renders if no report layout', () => {
    mockReportLayout = undefined;
    render(<ReportBuilder />);

    expect(screen.getByText('Report 1')).toBeInTheDocument();
  });

  // it('renders layout to canvas if it exists', () => {
  //   mockReportLayout = undefined;
  //   render(<ReportBuilder />);

  //   // TODO
  // });

  // it('is possible to drag about component onto canvas', () => {

  // })

  // it('is posssible to add two column layout and put something inside of it', () => {

  // });

  // it('saves', () => {

  // })
});
