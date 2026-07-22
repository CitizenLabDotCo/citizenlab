import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Project description builder display', () => {
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
    cy.visit(`/admin/description-builder/projects/${projectId}/description`);

    // Add the description as a text widget.
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('div.e2e-text-box').click('center');
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

    // Both the Content Builder description and the attachment are visible.
    cy.contains('Edited text.').should('be.visible');
    cy.get('#e2e-project-page-description-section')
      .find('#e2e-file-attachment')
      .contains('example.pdf')
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
      'PROJECT_PAGE_DESCRIPTION',
      'PROJECT_PAGE_PHASES',
      'PROJECT_PAGE_EVENTS',
    ],
    custom: { region: true },
    parent: 'ROOT',
    isCanvas: true,
    displayName: 'ProjectPageBody',
  }),
  PROJECT_PAGE_DESCRIPTION: node({
    type: { resolvedName: 'ProjectDescriptionSection' },
    nodes: ['TEXT', 'FILE'],
    parent: 'PROJECT_PAGE_BODY',
    isCanvas: true,
    displayName: 'ProjectDescriptionSection',
  }),
  TEXT: node({
    type: { resolvedName: 'TextMultiloc' },
    props: { text: { en: '<p>Edited text.</p>' } },
    parent: 'PROJECT_PAGE_DESCRIPTION',
    displayName: 'TextMultiloc',
  }),
  FILE: node({
    type: { resolvedName: 'FileAttachment' },
    props: { fileId },
    parent: 'PROJECT_PAGE_DESCRIPTION',
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
