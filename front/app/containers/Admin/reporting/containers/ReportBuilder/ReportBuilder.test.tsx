import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ReportBuilder from '.';

// service mocks

// hook mocks
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

let mockReportLayout;
jest.mock('api/report_layout/useReportLayout', () =>
  jest.fn(() => ({ data: { data: mockReportLayout } }))
);
jest.mock('api/reports/useReport');
jest.mock('../../hooks/useReportLocale', () => jest.fn(() => 'en'));

const surveyResultsNodes = {
  ROOT: {
    type: 'div',
    isCanvas: true,
    props: {
      id: 'e2e-content-builder-frame',
    },
    displayName: 'div',
    custom: {},
    hidden: false,
    nodes: ['pEOdj46oZz'],
    linkedNodes: {},
  },
  pEOdj46oZz: {
    type: {
      resolvedName: 'SurveyResultsWidget',
    },
    isCanvas: false,
    props: {
      title: 'Survey results',
    },
    displayName: 'SurveyResultsWidget',
    custom: {
      title: {
        id: 'app.containers.admin.ReportBuilder.surveyResults',
        defaultMessage: 'Survey results',
      },
      noPointerEvents: true,
    },
    parent: 'ROOT',
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
};

const surveyResultsLayout = {
  attributes: {
    craftjs_jsonmultiloc: {
      en: surveyResultsNodes,
    },
  },
};

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

  it('renders if report layout', () => {
    mockReportLayout = surveyResultsLayout;
    render(<ReportBuilder />);

    expect(screen.getByText('Report 1')).toBeInTheDocument();
  });

  it('renders layout to canvas if it exists', () => {
    mockReportLayout = surveyResultsLayout;
    render(<ReportBuilder />);

    expect(screen.getByTestId('survey-results-widget')).toBeInTheDocument();
  });
});
