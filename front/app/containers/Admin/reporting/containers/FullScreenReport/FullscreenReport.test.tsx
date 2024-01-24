import React from 'react';
import FullScreenReport from '.';
import { render } from 'utils/testUtils/rtl';

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));
jest.mock('js-confetti', () => jest.fn(() => ({ addConfetti: jest.fn() })));

const mockReportLayout = {
  data: {
    id: '47015505-1ef7-4757-8958-e6cbbbf278b4',
    type: 'content_builder_layout',
    attributes: {
      enabled: true,
      code: 'report',
      created_at: '2023-04-12T19:32:34.199Z',
      updated_at: '2023-12-12T15:15:57.469Z',
      craftjs_json: {
        ROOT: {
          type: 'div',
          nodes: ['shZVUJkAOA'],
          props: {
            id: 'e2e-content-builder-frame',
          },
          custom: {},
          hidden: false,
          isCanvas: true,
          displayName: 'div',
          linkedNodes: {},
        },
        '1VoNQ-ZaeL': {
          type: {
            resolvedName: 'TextMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: 'This is some text. You can edit and format it by using the editor in the panel on the right.',
            },
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'm',
          linkedNodes: {},
        },
        '2XVpT4492G': {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['jyWNuaCLxd'],
          props: {
            id: 'right',
          },
          custom: {},
          hidden: false,
          parent: 'jRtXII7IaI',
          isCanvas: true,
          displayName: 'Container',
          linkedNodes: {},
        },
        '39REHYVL4d': {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['xjuIBfAhnX'],
          props: {
            id: 'left',
          },
          custom: {},
          hidden: false,
          parent: 'jRtXII7IaI',
          isCanvas: true,
          displayName: 'Container',
          linkedNodes: {},
        },
        BTw0R9mG09: {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['GzGruyX3-W'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'Rbl3kFwWeU',
          isCanvas: true,
          displayName: 'Container',
          linkedNodes: {},
        },
        F6r1cpNR47: {
          type: {
            resolvedName: 'TitleMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: 'Project results',
            },
          },
          custom: {
            title: {
              id: 'app.components.admin.ContentBuilder.Widgets.Title.title',
              defaultMessage: 'Title',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'p',
          linkedNodes: {},
        },
        'GzGruyX3-W': {
          type: {
            resolvedName: 'TextMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: '\n            <ul>\n              <li>Project: Toronto Centre Traffic Regulation Review</li>\n              <li>Period: </li>\n              <li>Project manager: Tyler Johnson</li>\n            </ul>\n          ',
            },
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'BTw0R9mG09',
          isCanvas: false,
          displayName: 'm',
          linkedNodes: {},
        },
        LF201jK1J1: {
          type: {
            resolvedName: 'TextMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: 'This is some text. You can edit and format it by using the editor in the panel on the right.',
            },
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'm',
          linkedNodes: {},
        },
        LUH8oX7V7P: {
          type: {
            resolvedName: 'TitleMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: 'Visitors',
            },
          },
          custom: {
            title: {
              id: 'app.components.admin.ContentBuilder.Widgets.Title.title',
              defaultMessage: 'Title',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'p',
          linkedNodes: {},
        },
        M6hx7ufHfa: {
          type: {
            resolvedName: 'TextMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: 'This is some text. You can edit and format it by using the editor in the panel on the right.',
            },
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'm',
          linkedNodes: {},
        },
        MeAe2iEkA6: {
          type: {
            resolvedName: 'TitleMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: 'Report summary',
            },
          },
          custom: {
            title: {
              id: 'app.components.admin.ContentBuilder.Widgets.Title.title',
              defaultMessage: 'Title',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'p',
          linkedNodes: {},
        },
        Nj0RGqJb1D: {
          type: {
            resolvedName: 'WhiteSpace',
          },
          nodes: [],
          props: {
            size: '',
          },
          custom: {
            title: {
              id: 'app.containers.AdminPage.ProjectDescription.whiteSpace',
              defaultMessage: 'White space',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 's',
          linkedNodes: {},
        },
        Qq2a8lmRpi: {
          type: {
            resolvedName: 'TextMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: 'Add the goal of the project, participation methods used, and the outcome',
            },
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'm',
          linkedNodes: {},
        },
        Rbl3kFwWeU: {
          type: {
            resolvedName: 'AboutReportWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-04-12',
            reportId: 'd37598ff-e410-485d-9d8f-5d9c0649afa7',
            projectId: '7af89639-5cae-49cb-9a50-ec1f2163f5fc',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.aboutThisReport',
              defaultMessage: 'About this report',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'x',
          linkedNodes: {
            'about-text': 'BTw0R9mG09',
            'about-title': 'yveZLHfuCI',
          },
        },
        T3KLwg61Sq: {
          type: {
            resolvedName: 'MostReactedIdeasWidget',
          },
          nodes: [],
          props: {
            title: {
              en: 'Most voted ideas',
            },
            phaseId: '86b2ba54-5e76-44bd-9f9e-6a66bdb1af26',
            projectId: '7af89639-5cae-49cb-9a50-ec1f2163f5fc',
            numberOfIdeas: 5,
            collapseLongText: false,
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.mostVotedIeas',
              defaultMessage: 'Most voted ideas',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'f',
          linkedNodes: {},
        },
        Xjd2vrawDa: {
          type: {
            resolvedName: 'TitleMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: 'Participants',
            },
          },
          custom: {
            title: {
              id: 'app.components.admin.ContentBuilder.Widgets.Title.title',
              defaultMessage: 'Title',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'p',
          linkedNodes: {},
        },
        ZJPWgkjHxM: {
          type: {
            resolvedName: 'VisitorsWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-04-12',
            title: {
              en: 'Visitor timeline',
            },
            projectId: '7af89639-5cae-49cb-9a50-ec1f2163f5fc',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.visitorTimeline',
              defaultMessage: 'Visitor timeline',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 's',
          linkedNodes: {},
        },
        d0UxFB6GUK: {
          type: {
            resolvedName: 'TextMultiloc',
          },
          nodes: [],
          props: {
            text: {
              en: '\n              <h2>Traffic Regulation Review</h2>\n            ',
            },
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'yveZLHfuCI',
          isCanvas: false,
          displayName: 'm',
          linkedNodes: {},
        },
        imj58JyK6q: {
          type: {
            resolvedName: 'WhiteSpace',
          },
          nodes: [],
          props: {
            size: '',
          },
          custom: {
            title: {
              id: 'app.containers.AdminPage.ProjectDescription.whiteSpace',
              defaultMessage: 'White space',
            },
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 's',
          linkedNodes: {},
        },
        jRtXII7IaI: {
          type: {
            resolvedName: 'TwoColumn',
          },
          nodes: ['39REHYVL4d', '2XVpT4492G'],
          props: {
            columnLayout: '1-1',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.twoColumnLayout',
              defaultMessage: '2 column',
            },
            hasChildren: true,
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 'c',
          linkedNodes: {},
        },
        jyWNuaCLxd: {
          type: {
            resolvedName: 'AgeWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-04-12',
            title: {
              en: 'Users by age',
            },
            projectId: '7af89639-5cae-49cb-9a50-ec1f2163f5fc',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.usersByAge',
              defaultMessage: 'Users by age',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: '2XVpT4492G',
          isCanvas: false,
          displayName: 'u',
          linkedNodes: {},
        },
        klRmRduRnK: {
          type: {
            resolvedName: 'Box',
          },
          nodes: [
            'Rbl3kFwWeU',
            'MeAe2iEkA6',
            'Qq2a8lmRpi',
            'imj58JyK6q',
            'F6r1cpNR47',
            '1VoNQ-ZaeL',
            'z8auwNuI0h',
            'T3KLwg61Sq',
            'Nj0RGqJb1D',
            'Xjd2vrawDa',
            'LF201jK1J1',
            'jRtXII7IaI',
            'LUH8oX7V7P',
            'M6hx7ufHfa',
            'ZJPWgkjHxM',
          ],
          props: {},
          custom: {},
          hidden: false,
          parent: 'shZVUJkAOA',
          isCanvas: true,
          displayName: 'Box',
          linkedNodes: {},
        },
        shZVUJkAOA: {
          type: {
            resolvedName: 'ProjectTemplate',
          },
          nodes: [],
          props: {
            reportId: 'd37598ff-e410-485d-9d8f-5d9c0649afa7',
            projectId: '7af89639-5cae-49cb-9a50-ec1f2163f5fc',
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'ProjectTemplate',
          linkedNodes: {
            'project-report-template': 'klRmRduRnK',
          },
        },
        xjuIBfAhnX: {
          type: {
            resolvedName: 'GenderWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-04-12',
            title: {
              en: 'Users by gender',
            },
            projectId: '7af89639-5cae-49cb-9a50-ec1f2163f5fc',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.usersByGender',
              defaultMessage: 'Users by gender',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: '39REHYVL4d',
          isCanvas: false,
          displayName: 'u',
          linkedNodes: {},
        },
        yveZLHfuCI: {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['d0UxFB6GUK'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'Rbl3kFwWeU',
          isCanvas: true,
          displayName: 'Container',
          linkedNodes: {},
        },
        z8auwNuI0h: {
          type: {
            resolvedName: 'ActiveUsersWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-04-12',
            title: {
              en: 'Participants timeline',
            },
            projectId: '7af89639-5cae-49cb-9a50-ec1f2163f5fc',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.activeUsersTimeline',
              defaultMessage: 'Participants timeline',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'klRmRduRnK',
          isCanvas: false,
          displayName: 's',
          linkedNodes: {},
        },
      },
    },
  },
};

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
  it('renders if report layout is valid', () => {
    const { container } = render(<FullScreenReport />);
    expect(
      container.querySelector('#e2e-content-builder-frame')
    ).toBeInTheDocument();
  });
});
