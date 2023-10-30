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
    id: '838a988f-bbcc-4095-bb30-cc8e653704db',
    type: 'content_builder_layout',
    attributes: {
      enabled: true,
      code: 'report',
      created_at: '2023-10-30T17:22:58.237Z',
      updated_at: '2023-10-30T17:23:04.352Z',
      craftjs_jsonmultiloc: {
        en: {
          ROOT: {
            type: 'div',
            nodes: ['piK-v5NK_d'],
            props: {
              id: 'e2e-content-builder-frame',
            },
            custom: {},
            hidden: false,
            isCanvas: true,
            displayName: 'div',
            linkedNodes: {},
            parent: undefined as any, // craft-js types are not correct and always require parent
          },
          '-2sId3IRbf': {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'Title',
            linkedNodes: {},
          },
          '-oAKHSbNtS': {
            type: {
              resolvedName: 'GenderWidget',
            },
            nodes: [],
            props: {
              endAt: '2023-10-30',
              title: 'Users by gender',
              projectId: 'f229c7e1-cf50-45fe-a231-dd52cd1e7037',
            },
            custom: {
              title: {
                id: 'app.containers.admin.ReportBuilder.charts.usersByGender',
                defaultMessage: 'Users by gender',
              },
              noPointerEvents: true,
            },
            hidden: false,
            parent: 'qr2e7aGpiJ',
            isCanvas: false,
            displayName: 'GenderWidget',
            linkedNodes: {},
          },
          '1D235zXOpI': {
            type: {
              resolvedName: 'AgeWidget',
            },
            nodes: [],
            props: {
              endAt: '2023-10-30',
              title: 'Users by age',
              projectId: 'f229c7e1-cf50-45fe-a231-dd52cd1e7037',
            },
            custom: {
              title: {
                id: 'app.containers.admin.ReportBuilder.charts.usersByAge',
                defaultMessage: 'Users by age',
              },
              noPointerEvents: true,
            },
            hidden: false,
            parent: 'GWFxift8X4',
            isCanvas: false,
            displayName: 'AgeWidget',
            linkedNodes: {},
          },
          '2YLP_cLZjn': {
            type: {
              resolvedName: 'ActiveUsersWidget',
            },
            nodes: [],
            props: {
              endAt: '2023-10-30',
              title: 'Participants timeline',
              projectId: 'f229c7e1-cf50-45fe-a231-dd52cd1e7037',
            },
            custom: {
              title: {
                id: 'app.containers.admin.ReportBuilder.charts.activeUsersTimeline',
                defaultMessage: 'Participants timeline',
              },
              noPointerEvents: true,
            },
            hidden: false,
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'ActiveUsersWidget',
            linkedNodes: {},
          },
          '4V3_Kba9lq': {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'Text',
            linkedNodes: {},
          },
          '7giFesTRse': {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'Text',
            linkedNodes: {},
          },
          EtGenGqsas: {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'Text',
            linkedNodes: {},
          },
          // G6IhcWWI4Z: {
          //   type: {
          //     resolvedName: 'VisitorsWidget',
          //   },
          //   nodes: [],
          //   props: {
          //     endAt: '2023-10-30',
          //     title: 'Visitor timeline',
          //     projectId: 'f229c7e1-cf50-45fe-a231-dd52cd1e7037',
          //   },
          //   custom: {
          //     title: {
          //       id: 'app.containers.admin.ReportBuilder.charts.visitorTimeline',
          //       defaultMessage: 'Visitor timeline',
          //     },
          //     noPointerEvents: true,
          //   },
          //   hidden: false,
          //   parent: 'X_opigwx8m',
          //   isCanvas: false,
          //   displayName: 'VisitorsWidget',
          //   linkedNodes: {},
          // },
          GWFxift8X4: {
            type: {
              resolvedName: 'Container',
            },
            nodes: ['1D235zXOpI'],
            props: {
              id: 'right',
            },
            custom: {},
            hidden: false,
            parent: 'PeS1X8smYx',
            isCanvas: true,
            displayName: 'Container',
            linkedNodes: {},
          },
          PeS1X8smYx: {
            type: {
              resolvedName: 'TwoColumn',
            },
            nodes: ['qr2e7aGpiJ', 'GWFxift8X4'],
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'TwoColumn',
            linkedNodes: {},
          },
          QVtiPlQhLK: {
            type: {
              resolvedName: 'AboutReportWidget',
            },
            nodes: [],
            props: {
              endAt: '2023-10-30',
              reportId: '37f6271b-2b24-4229-9154-48b4e2c1c653',
              projectId: 'f229c7e1-cf50-45fe-a231-dd52cd1e7037',
            },
            custom: {
              title: {
                id: 'app.containers.admin.ReportBuilder.aboutThisReport',
                defaultMessage: 'About this report',
              },
            },
            hidden: false,
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'AboutReportWidget',
            linkedNodes: {
              'about-text': 'rR70ZdvoTR',
              'about-title': 'cKixr3f4cL',
            },
          },
          SbVIyccQVZ: {
            type: {
              resolvedName: 'Text',
            },
            nodes: [],
            props: {
              text: '\n              \u003ch2\u003eTest report\u003c/h2\u003e\n            ',
            },
            custom: {
              title: {
                id: 'app.containers.admin.ContentBuilder.text',
                defaultMessage: 'Text',
              },
            },
            hidden: false,
            parent: 'cKixr3f4cL',
            isCanvas: false,
            displayName: 'Text',
            linkedNodes: {},
          },
          SvASzuRKfw: {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'WhiteSpace',
            linkedNodes: {},
          },
          X_opigwx8m: {
            type: {
              resolvedName: 'Box',
            },
            nodes: [
              'QVtiPlQhLK',
              'sCPUmtwqiE',
              'dOyCnbltiC',
              'Y5s9AHSlIZ',
              '-2sId3IRbf',
              'EtGenGqsas',
              '2YLP_cLZjn',
              'dFCkEUcCHN',
              'SvASzuRKfw',
              'iRENg1BU6G',
              '7giFesTRse',
              'PeS1X8smYx',
              'zZqC-iR-hj',
              '4V3_Kba9lq',
              // 'G6IhcWWI4Z',
            ],
            props: {},
            custom: {},
            hidden: false,
            parent: 'piK-v5NK_d',
            isCanvas: true,
            displayName: 'Box',
            linkedNodes: {},
          },
          Y5s9AHSlIZ: {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'WhiteSpace',
            linkedNodes: {},
          },
          cKixr3f4cL: {
            type: {
              resolvedName: 'Container',
            },
            nodes: ['SbVIyccQVZ'],
            props: {},
            custom: {},
            hidden: false,
            parent: 'QVtiPlQhLK',
            isCanvas: true,
            displayName: 'Container',
            linkedNodes: {},
          },
          dFCkEUcCHN: {
            type: {
              resolvedName: 'MostReactedIdeasWidget',
            },
            nodes: [],
            props: {
              title: 'Most reacted ideas',
              projectId: 'f229c7e1-cf50-45fe-a231-dd52cd1e7037',
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'MostReactedIdeasWidget',
            linkedNodes: {},
          },
          dOyCnbltiC: {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'Text',
            linkedNodes: {},
          },
          iRENg1BU6G: {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'Title',
            linkedNodes: {},
          },
          pX9khaAR36: {
            type: {
              resolvedName: 'Text',
            },
            nodes: [],
            props: {
              text: '\n            \u003cul\u003e\n              \u003cli\u003eProject: \u003c/li\u003e\n              \u003cli\u003ePeriod: \u003c/li\u003e\n              \u003cli\u003eProject manager: Julienne Thuram\u003c/li\u003e\n            \u003c/ul\u003e\n          ',
            },
            custom: {
              title: {
                id: 'app.containers.admin.ContentBuilder.text',
                defaultMessage: 'Text',
              },
            },
            hidden: false,
            parent: 'rR70ZdvoTR',
            isCanvas: false,
            displayName: 'Text',
            linkedNodes: {},
          },
          'piK-v5NK_d': {
            type: {
              resolvedName: 'ProjectTemplate',
            },
            nodes: [],
            props: {
              reportId: '37f6271b-2b24-4229-9154-48b4e2c1c653',
              projectId: 'f229c7e1-cf50-45fe-a231-dd52cd1e7037',
            },
            custom: {},
            hidden: false,
            parent: 'ROOT',
            isCanvas: false,
            displayName: 'ProjectTemplate',
            linkedNodes: {
              'project-report-template': 'X_opigwx8m',
            },
          },
          qr2e7aGpiJ: {
            type: {
              resolvedName: 'Container',
            },
            nodes: ['-oAKHSbNtS'],
            props: {
              id: 'left',
            },
            custom: {},
            hidden: false,
            parent: 'PeS1X8smYx',
            isCanvas: true,
            displayName: 'Container',
            linkedNodes: {},
          },
          rR70ZdvoTR: {
            type: {
              resolvedName: 'Container',
            },
            nodes: ['pX9khaAR36'],
            props: {},
            custom: {},
            hidden: false,
            parent: 'QVtiPlQhLK',
            isCanvas: true,
            displayName: 'Container',
            linkedNodes: {},
          },
          sCPUmtwqiE: {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'Title',
            linkedNodes: {},
          },
          'zZqC-iR-hj': {
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
            parent: 'X_opigwx8m',
            isCanvas: false,
            displayName: 'Title',
            linkedNodes: {},
          },
        },
      },
    },
  },
};
