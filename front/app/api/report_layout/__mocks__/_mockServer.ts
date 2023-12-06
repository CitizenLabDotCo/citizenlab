import { API_PATH } from 'containers/App/constants';
import { rest } from 'msw';
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
          nodes: [
            'iHhZ4s3csd',
            'TA7RQNyDgR',
            'pwV7EeAqeK',
            'gl7jsKs3NF',
            'cVSVPkQLRZ',
            'jan173bJuF',
            'iKDVaI9FjR',
            'iigouUt9Cl',
          ],
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
        '-_lfpFVS5R': {
          type: {
            resolvedName: 'Title',
          },
          nodes: [],
          props: {
            text: 'Project results',
          },
          custom: {
            title: {
              id: 'app.components.admin.ContentBuilder.Widgets.Title.title',
              defaultMessage: 'Title',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'v',
          linkedNodes: {},
        },
        '0OlQ1ADHUY': {
          type: {
            resolvedName: 'TwoColumn',
          },
          nodes: ['RKo-EQrxjW', 'kzWzR65st6'],
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
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'g',
          linkedNodes: {},
        },
        '0yvpRXrriy': {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['btFtT0qots'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'iigouUt9Cl',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        '5RY2UMnRce': {
          type: {
            resolvedName: 'Title',
          },
          nodes: [],
          props: {
            text: 'Participants',
          },
          custom: {
            title: {
              id: 'app.components.admin.ContentBuilder.Widgets.Title.title',
              defaultMessage: 'Title',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'v',
          linkedNodes: {},
        },
        '61RJLY_E22': {
          type: {
            resolvedName: 'Text',
          },
          nodes: [],
          props: {
            text: 'This is some text. You can edit and format it by using the editor in the panel on the right.',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'u',
          linkedNodes: {},
        },
        '69HnH-jOI5': {
          type: {
            resolvedName: 'Text',
          },
          nodes: [],
          props: {
            text: '\n              \u003ch2\u003ejferpjbit vijrpeb\u003c/h2\u003e\n            ',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'CooYP0mxiw',
          isCanvas: false,
          displayName: 'u',
          linkedNodes: {},
        },
        '8O2xLP2UE2': {
          type: {
            resolvedName: 'Text',
          },
          nodes: [],
          props: {
            text: 'Add the goal of the project, participation methods used, and the outcome',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'u',
          linkedNodes: {},
        },
        '9rTDErWFO4': {
          type: {
            resolvedName: 'ReactionsByTimeWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Reactions',
          },
          custom: {
            title: {
              id: 'app.containers.AdminPage.DashboardPage.reactions',
              defaultMessage: 'Reactions',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'XIKqXhig20',
          isCanvas: false,
          displayName: 'j',
          linkedNodes: {},
        },
        BizJ0vo9nC: {
          type: {
            resolvedName: 'CommentsByTimeWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Comments',
          },
          custom: {
            title: {
              id: 'app.containers.AdminPage.DashboardPage.comments',
              defaultMessage: 'Comments',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'jJTPMjrP7-',
          isCanvas: false,
          displayName: 'j',
          linkedNodes: {},
        },
        CooYP0mxiw: {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['69HnH-jOI5'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'vrC7wx2MAV',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        HaCzL9x7TD: {
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
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'i',
          linkedNodes: {},
        },
        'Je74-RvLh3': {
          type: {
            resolvedName: 'Box',
          },
          nodes: [
            'vrC7wx2MAV',
            'MHSmpLr931',
            '8O2xLP2UE2',
            'iHeIkulvfz',
            '-_lfpFVS5R',
            'p_hKsMB8rA',
            'Vc7ehPuX7Y',
            'sDEh4sHy6H',
            'HaCzL9x7TD',
            '5RY2UMnRce',
            'aX1Hf8Lh9U',
            '0OlQ1ADHUY',
            'a-QkcQr35J',
            '61RJLY_E22',
            'Xtjeu1oRkU',
          ],
          props: {},
          custom: {},
          hidden: false,
          parent: 'iHhZ4s3csd',
          isCanvas: true,
          displayName: 'Box',
          linkedNodes: {},
        },
        MHSmpLr931: {
          type: {
            resolvedName: 'Title',
          },
          nodes: [],
          props: {
            text: 'Report summary',
          },
          custom: {
            title: {
              id: 'app.components.admin.ContentBuilder.Widgets.Title.title',
              defaultMessage: 'Title',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'v',
          linkedNodes: {},
        },
        'RKo-EQrxjW': {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['lFUl_1QVMb'],
          props: {
            id: 'left',
          },
          custom: {},
          hidden: false,
          parent: '0OlQ1ADHUY',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        TA7RQNyDgR: {
          type: {
            resolvedName: 'VisitorsTrafficSourcesWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Traffic sources',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.trafficSources',
              defaultMessage: 'Traffic sources',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'j',
          linkedNodes: {},
        },
        Vc7ehPuX7Y: {
          type: {
            resolvedName: 'ActiveUsersWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Participants timeline',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.activeUsersTimeline',
              defaultMessage: 'Participants timeline',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'T',
          linkedNodes: {},
        },
        XIKqXhig20: {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['9rTDErWFO4'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'iKDVaI9FjR',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        Xtjeu1oRkU: {
          type: {
            resolvedName: 'VisitorsWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Visitor timeline',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.visitorTimeline',
              defaultMessage: 'Visitor timeline',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'C',
          linkedNodes: {},
        },
        YBGtLjj4vT: {
          type: {
            resolvedName: 'Container',
          },
          nodes: [],
          props: {},
          custom: {},
          hidden: false,
          parent: 'iigouUt9Cl',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        ZAL0LPHIfR: {
          type: {
            resolvedName: 'PostsByTimeWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Posts',
          },
          custom: {
            title: {
              id: 'app.containers.AdminPage.DashboardPage.inputs',
              defaultMessage: 'Inputs',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'lYvZ8t36LA',
          isCanvas: false,
          displayName: 'j',
          linkedNodes: {},
        },
        'a-QkcQr35J': {
          type: {
            resolvedName: 'Title',
          },
          nodes: [],
          props: {
            text: 'Visitors',
          },
          custom: {
            title: {
              id: 'app.components.admin.ContentBuilder.Widgets.Title.title',
              defaultMessage: 'Title',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'v',
          linkedNodes: {},
        },
        aX1Hf8Lh9U: {
          type: {
            resolvedName: 'Text',
          },
          nodes: [],
          props: {
            text: 'This is some text. You can edit and format it by using the editor in the panel on the right.',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'u',
          linkedNodes: {},
        },
        btFtT0qots: {
          type: {
            resolvedName: 'VisitorsWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Visitor timeline',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.visitorTimeline',
              defaultMessage: 'Visitor timeline',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: '0yvpRXrriy',
          isCanvas: false,
          displayName: 'C',
          linkedNodes: {},
        },
        cVSVPkQLRZ: {
          type: {
            resolvedName: 'ReactionsByTimeWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Reactions',
          },
          custom: {
            title: {
              id: 'app.containers.AdminPage.DashboardPage.reactions',
              defaultMessage: 'Reactions',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'j',
          linkedNodes: {},
        },
        fMz_GuhflM: {
          type: {
            resolvedName: 'AgeWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Users by age',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.usersByAge',
              defaultMessage: 'Users by age',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'kzWzR65st6',
          isCanvas: false,
          displayName: 'a',
          linkedNodes: {},
        },
        gOyitlirlL: {
          type: {
            resolvedName: 'ActiveUsersWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Participants timeline',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.activeUsersTimeline',
              defaultMessage: 'Participants timeline',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'uIJa-uJ9Gp',
          isCanvas: false,
          displayName: 'T',
          linkedNodes: {},
        },
        gl7jsKs3NF: {
          type: {
            resolvedName: 'CommentsByTimeWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Comments',
          },
          custom: {
            title: {
              id: 'app.containers.AdminPage.DashboardPage.comments',
              defaultMessage: 'Comments',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'j',
          linkedNodes: {},
        },
        gnAzU2g3qe: {
          type: {
            resolvedName: 'Text',
          },
          nodes: [],
          props: {
            text: '\n            \u003cul\u003e\n              \u003cli\u003eProject: \u003c/li\u003e\n              \u003cli\u003ePeriod: \u003c/li\u003e\n              \u003cli\u003eProject manager: Citizenlab Hermansen\u003c/li\u003e\n            \u003c/ul\u003e\n          ',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'jdfXI8jwoJ',
          isCanvas: false,
          displayName: 'u',
          linkedNodes: {},
        },
        iHeIkulvfz: {
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
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'i',
          linkedNodes: {},
        },
        iHhZ4s3csd: {
          type: {
            resolvedName: 'ProjectTemplate',
          },
          nodes: [],
          props: {
            reportId: 'da8a2cef-c520-45b9-9ea7-c5be71a36aa4',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'tt',
          linkedNodes: {
            'project-report-template': 'Je74-RvLh3',
          },
        },
        iKDVaI9FjR: {
          type: {
            resolvedName: 'TwoColumn',
          },
          nodes: [],
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
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'g',
          linkedNodes: {
            left: 'jJTPMjrP7-',
            right: 'XIKqXhig20',
          },
        },
        iigouUt9Cl: {
          type: {
            resolvedName: 'TwoColumn',
          },
          nodes: [],
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
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'g',
          linkedNodes: {
            left: '0yvpRXrriy',
            right: 'YBGtLjj4vT',
          },
        },
        'jJTPMjrP7-': {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['BizJ0vo9nC'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'iKDVaI9FjR',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        jan173bJuF: {
          type: {
            resolvedName: 'TwoColumn',
          },
          nodes: [],
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
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'g',
          linkedNodes: {
            left: 'uIJa-uJ9Gp',
            right: 'lYvZ8t36LA',
          },
        },
        jdfXI8jwoJ: {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['gnAzU2g3qe'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'vrC7wx2MAV',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        kzWzR65st6: {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['fMz_GuhflM'],
          props: {
            id: 'right',
          },
          custom: {},
          hidden: false,
          parent: '0OlQ1ADHUY',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        lFUl_1QVMb: {
          type: {
            resolvedName: 'GenderWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Users by gender',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.charts.usersByGender',
              defaultMessage: 'Users by gender',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'RKo-EQrxjW',
          isCanvas: false,
          displayName: 'r',
          linkedNodes: {},
        },
        lYvZ8t36LA: {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['ZAL0LPHIfR'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'jan173bJuF',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        p_hKsMB8rA: {
          type: {
            resolvedName: 'Text',
          },
          nodes: [],
          props: {
            text: 'This is some text. You can edit and format it by using the editor in the panel on the right.',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ContentBuilder.text',
              defaultMessage: 'Text',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'u',
          linkedNodes: {},
        },
        pwV7EeAqeK: {
          type: {
            resolvedName: 'PostsByTimeWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            title: 'Posts',
          },
          custom: {
            title: {
              id: 'app.containers.AdminPage.DashboardPage.inputs',
              defaultMessage: 'Inputs',
            },
            noPointerEvents: true,
          },
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'j',
          linkedNodes: {},
        },
        sDEh4sHy6H: {
          type: {
            resolvedName: 'MostReactedIdeasWidget',
          },
          nodes: [],
          props: {
            title: 'Most reacted ideas',
            phaseId: 'b9cea8fc-0429-4bca-939d-f0e0ec5b3ad4',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
            numberOfIdeas: 5,
            collapseLongText: false,
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.MostReactedIdeasWidget.mostReactedIdeas',
              defaultMessage: 'Most reacted ideas',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'et',
          linkedNodes: {},
        },
        'uIJa-uJ9Gp': {
          type: {
            resolvedName: 'Container',
          },
          nodes: ['gOyitlirlL'],
          props: {},
          custom: {},
          hidden: false,
          parent: 'jan173bJuF',
          isCanvas: true,
          displayName: 'v',
          linkedNodes: {},
        },
        vrC7wx2MAV: {
          type: {
            resolvedName: 'AboutReportWidget',
          },
          nodes: [],
          props: {
            endAt: '2023-11-03',
            reportId: 'da8a2cef-c520-45b9-9ea7-c5be71a36aa4',
            projectId: '8f1dffb8-0fb6-4f00-af70-55c757f78f14',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.aboutThisReport',
              defaultMessage: 'About this report',
            },
          },
          hidden: false,
          parent: 'Je74-RvLh3',
          isCanvas: false,
          displayName: 'U',
          linkedNodes: {
            'about-text': 'jdfXI8jwoJ',
            'about-title': 'CooYP0mxiw',
          },
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
            title: 'Survey results',
            projectId: '1',
          },
          custom: {
            title: {
              id: 'app.containers.admin.ReportBuilder.surveyResults',
              defaultMessage: 'Survey results',
            },
            noPointerEvents: true,
          },
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
