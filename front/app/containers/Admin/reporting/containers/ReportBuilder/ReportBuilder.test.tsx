import React from 'react';
import { render, screen, waitFor } from 'utils/testUtils/rtl';
import ReportBuilder from '.';

// hook mocks
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

let mockReportLayout;
jest.mock('api/report_layout/useReportLayout', () =>
  jest.fn(() => ({ data: mockReportLayout }))
);

const mockReport = {
  id: '1',
  type: 'report',
  attributes: {
    name: 'Report 1',
    created_at: '2020-10-20T09:00:00.000Z',
    updated_at: '2020-10-20T09:00:00.000Z',
    action_descriptor: {
      editing_report: {
        enabled: true,
        disabled_reason: null,
      },
    },
  },
  relationships: {
    layout: {
      data: {
        id: 'layoutId',
        type: 'content-builder-layout',
      },
    },
    owner: {
      data: {
        id: 'userId',
        type: 'user',
      },
    },
    phase: { data: { id: 'ph1' } },
  },
};

jest.mock('api/reports/useReport', () =>
  jest.fn(() => ({
    data: {
      data: mockReport,
    },
  }))
);

jest.mock('api/phases/usePhase', () =>
  jest.fn(() => ({
    data: { data: { relationships: { project: { data: { id: 'pr1' } } } } },
  }))
);

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
      title: {
        en: 'Survey results',
      },
    },
    displayName: 'SurveyResultsWidget',
    custom: {},
    parent: 'ROOT',
    hidden: false,
    nodes: [],
    linkedNodes: {},
  },
};

const surveyResultsLayout = {
  attributes: {
    craftjs_json: surveyResultsNodes,
  },
};

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

// other mocks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({
    pathname: 'admin/reporting/report-builder/r1/editor',
  })),
  useParams: jest.fn(() => ({ reportId: 'r1' })),
}));

jest.mock(
  'components/admin/ContentBuilder/FullscreenContentBuilder',
  () =>
    ({ children }) =>
      <>{children}</>
);

describe('<ReportBuilder />', () => {
  it('renders layout to canvas if it exists', async () => {
    mockReportLayout = { data: surveyResultsLayout };
    render(<ReportBuilder />);

    await waitFor(() => {
      expect(screen.getByTestId('survey-results-widget')).toBeInTheDocument();
    });
  });
});
