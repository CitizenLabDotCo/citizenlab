import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Project description builder display', () => {
  const getIframeBody = () =>
    cy
      .get('iframe')
      .its('0.contentDocument')
      .should('exist')
      .its('body')
      .should('not.be.undefined')
      .then(cy.wrap);

  let projectId = '';
  let projectSlug = '';
  let userId = '';
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = 'Content Builder project description.';
  let phaseId: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAdminAuthUser().then((user) => {
      userId = user.body.data.id;
    });
  });

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }

    cy.setAdminLoginCookie();
    // The project starts with no description; it is authored in the Content
    // Builder below (the inline WYSIWYG editor has been sunset).
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: '',
      publicationStatus: 'published',
      assigneeId: userId,
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = projectTitle;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
        cy.visit(`/projects/${projectSlug}`);
      });
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
    projectId = '';
  });

  it('shows a description authored in the Content Builder on the project page', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    cy.apiToggleProjectDescriptionBuilder({ projectId });
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);

    // Add the description as a text widget. The blank project starts with
    // seeded text widgets, so target the one that was just dropped.
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-project-page-body', {
      position: 'inside',
    });
    cy.get('div.e2e-text-box').first().click('center');
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type(projectDescription, { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    // Go to project page — the description renders through the Content Builder.
    cy.visit(`/projects/${projectSlug}`);
    cy.contains(projectDescription).should('be.visible');
  });

  it('shows a file attachment widget alongside the Content Builder description', () => {
    cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
      const adminJwt = response.body.jwt;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      };

      // Upload a file to the project's file repository.
      cy.fixture('example.pdf', 'base64')
        .then((fileContent) => {
          return cy.request({
            headers,
            method: 'POST',
            url: 'web_api/v1/files',
            body: {
              file: {
                name: 'example.pdf',
                content: `data:application/pdf;base64,${fileContent}`,
                project: projectId,
              },
            },
          });
        })
        .then((fileResponse) => {
          // Author a project page holding the description and a FileAttachment
          // widget, as the project page builder does.
          cy.request({
            headers,
            method: 'POST',
            url: `web_api/v1/projects/${projectId}/content_builder_layouts/project_page/upsert`,
            body: {
              content_builder_layout: {
                enabled: true,
                craftjs_json: projectPageLayoutWithFile(
                  fileResponse.body.data.id
                ),
              },
            },
          });
        });
    });

    cy.visit(`/projects/${projectSlug}`);

    // The description and the attachment (in the two-column's wide column)
    // are both visible.
    cy.contains('Edited text.').should('be.visible');
    cy.get('.e2e-two-column #e2e-file-attachment')
      .contains('example.pdf')
      .should('be.visible');

    cy.visit(`/admin/project-page-builder/projects/${projectId}`);
    cy.get('div#ROOT');
    cy.get('#e2e-preview-toggle').click({ force: true });
    getIframeBody()
      .find('#e2e-file-attachment')
      .contains('example.pdf')
      .should('be.visible');
  });

  it('shows a file swapped in the builder in the preview, without a reload', () => {
    // The backend rebuilds the layout's file attachments on save, and the preview is a
    // separate document with its own cache: it has to refetch them or it keeps showing the
    // file that was on the layout when it loaded.
    cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${response.body.jwt}`,
      };

      cy.fixture('example.pdf', 'base64')
        .then((fileContent) =>
          cy.request({
            headers,
            method: 'POST',
            url: 'web_api/v1/files',
            body: {
              file: {
                name: 'example.pdf',
                content: `data:application/pdf;base64,${fileContent}`,
                project: projectId,
              },
            },
          })
        )
        .then((fileResponse) =>
          cy.request({
            headers,
            method: 'POST',
            url: `web_api/v1/projects/${projectId}/content_builder_layouts/project_page/upsert`,
            body: {
              content_builder_layout: {
                enabled: true,
                craftjs_json: projectPageLayoutWithFile(
                  fileResponse.body.data.id
                ),
              },
            },
          })
        );

      cy.fixture('example.pdf', 'base64').then((fileContent) =>
        cy.request({
          headers,
          method: 'POST',
          url: 'web_api/v1/files',
          body: {
            file: {
              name: 'replacement.pdf',
              content: `data:application/pdf;base64,${fileContent}`,
              project: projectId,
            },
          },
        })
      );
    });

    cy.visit(`/admin/project-page-builder/projects/${projectId}`);
    cy.get('div#ROOT');

    // The preview has now read the layout's attachments, and holds example.pdf.
    getIframeBody().should('contain.text', 'example.pdf');

    // The widget takes no pointer events in the builder, so select the node around it.
    cy.get('#e2e-file-attachment').parents('.e2e-render-node').first().click();
    cy.dataCy('e2e-file-attachment-file-select').select('replacement.pdf');
    cy.wait(1000);

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(1000);

    cy.get('#e2e-preview-toggle').click({ force: true });
    getIframeBody()
      .find('#e2e-file-attachment')
      .contains('replacement.pdf')
      .should('be.visible');
  });
});

const node = (override: Record<string, unknown>) => ({
  nodes: [],
  props: {},
  custom: {},
  hidden: false,
  isCanvas: false,
  linkedNodes: {},
  ...override,
});

const projectPageLayoutWithFile = (fileId: string) => ({
  ROOT: node({
    type: { resolvedName: 'ProjectPageRoot' },
    nodes: ['PROJECT_PAGE_BANNER', 'PROJECT_PAGE_TITLE', 'PROJECT_PAGE_BODY'],
    custom: { region: true },
    isCanvas: true,
    displayName: 'ProjectPageRoot',
  }),
  PROJECT_PAGE_BANNER: node({
    type: { resolvedName: 'ProjectBanner' },
    props: { image: {}, alt: {} },
    parent: 'ROOT',
    displayName: 'ProjectBanner',
  }),
  PROJECT_PAGE_TITLE: node({
    type: { resolvedName: 'ProjectTitle' },
    parent: 'ROOT',
    displayName: 'ProjectTitle',
  }),
  PROJECT_PAGE_BODY: node({
    type: { resolvedName: 'ProjectPageBody' },
    nodes: [
      'TEXT',
      'SPACE',
      'COLUMNS',
      'PROJECT_PAGE_PHASES',
      'PROJECT_PAGE_EVENTS',
    ],
    custom: { region: true },
    parent: 'ROOT',
    isCanvas: true,
    displayName: 'ProjectPageBody',
  }),
  TEXT: node({
    type: { resolvedName: 'TextMultiloc' },
    props: { text: { en: '<p>Edited text.</p>' } },
    parent: 'PROJECT_PAGE_BODY',
    displayName: 'TextMultiloc',
  }),
  SPACE: node({
    type: { resolvedName: 'WhiteSpace' },
    props: { size: 'small' },
    parent: 'PROJECT_PAGE_BODY',
    displayName: 'WhiteSpace',
  }),
  COLUMNS: node({
    type: { resolvedName: 'TwoColumn' },
    nodes: ['LEFT', 'RIGHT'],
    props: { columnLayout: '2-1' },
    parent: 'PROJECT_PAGE_BODY',
    displayName: 'TwoColumn',
  }),
  LEFT: node({
    type: { resolvedName: 'Container' },
    nodes: ['FILE'],
    props: { id: 'left' },
    parent: 'COLUMNS',
    isCanvas: true,
    displayName: 'Container',
  }),
  RIGHT: node({
    type: { resolvedName: 'Container' },
    props: { id: 'right' },
    parent: 'COLUMNS',
    isCanvas: true,
    displayName: 'Container',
  }),
  FILE: node({
    type: { resolvedName: 'FileAttachment' },
    props: { fileId },
    parent: 'LEFT',
    displayName: 'FileAttachment',
  }),
  PROJECT_PAGE_PHASES: node({
    type: { resolvedName: 'PhasesWidget' },
    parent: 'PROJECT_PAGE_BODY',
    displayName: 'PhasesWidget',
  }),
  PROJECT_PAGE_EVENTS: node({
    type: { resolvedName: 'EventsWidget' },
    parent: 'PROJECT_PAGE_BODY',
    displayName: 'EventsWidget',
  }),
});
