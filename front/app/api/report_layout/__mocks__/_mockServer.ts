import { rest } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { ReportLayoutResponse } from '../types';

export const apiPath = `${API_PATH}/reports/:id/layout`;
export const apiPathUpdate = `${API_PATH}/reports/:id`;

const endpoints = {
  'GET reports/:id/layout': rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(reportLayout));
  }),
};

export default endpoints;

export const reportLayout: ReportLayoutResponse = {
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
          parent: undefined as any,
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
          custom: {},
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
            resolvedName: 'ParticipantsWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-04-12',
            title: {
              en: 'Participants timeline',
            },
            projectId: '7af89639-5cae-49cb-9a50-ec1f2163f5fc',
          },
          custom: {},
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

export const surveyReportHandler = rest.get(apiPath, (_req, res, ctx) => {
  return res(ctx.status(200), ctx.json(surveyReportLayout));
});

const surveyReportLayout: ReportLayoutResponse = {
  data: {
    id: 'b5382874-fcd7-49c8-afe8-d07eeb637acb',
    type: 'content_builder_layout',
    attributes: {
      enabled: true,
      code: 'report',
      created_at: '2023-11-03T16:06:55.423Z',
      updated_at: '2023-11-03T16:14:32.103Z',
      craftjs_json: {
        ROOT: {
          type: 'div',
          nodes: ['2Fc0uXw11H'],
          props: {
            id: 'e2e-content-builder-frame',
          },
          custom: {},
          hidden: false,
          isCanvas: true,
          displayName: 'div',
          linkedNodes: {},
          parent: undefined as any, // craft-js' own types are incorrect
        },
        '2Fc0uXw11H': {
          type: {
            resolvedName: 'SurveyResultsWidget',
          },
          nodes: [],
          props: {
            title: {
              en: 'Survey results',
            },
            projectId: '1',
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'f',
          linkedNodes: {},
        },
      },
    },
  },
};
