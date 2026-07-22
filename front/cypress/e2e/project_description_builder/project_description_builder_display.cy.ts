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

  it('shows attachments added to the project alongside the Content Builder description', () => {
    cy.intercept(`**/files`).as('saveProjectFiles');
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    // Attach a project file
    cy.visit(`admin/projects/${projectId}/general`);
    // This 4s wait is necessary. I tried waiting in a number of other ways,
    // but this was the only consistent solution.
    cy.wait(4000);
    cy.scrollTo('bottom', { ensureScrollable: false });

    // Open the file upload modal
    cy.get('#e2e-open-file-upload-modal-button').should('exist');
    cy.get('#e2e-open-file-upload-modal-button').click();
    cy.get('#e2e-file-upload-input').should('exist');

    cy.get('#e2e-file-upload-input').selectFile('cypress/fixtures/example.pdf');
    cy.contains('example.pdf').should('exist');
    cy.wait(2000);

    // Submit project
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.wait('@saveProjectFiles');
    cy.contains('Your form has been saved!').should('be.visible');

    // Add the description in the Content Builder.
    cy.apiToggleProjectDescriptionBuilder({ projectId });
    cy.visit(`/admin/description-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('div.e2e-text-box').click('center');
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);

    // Both the Content Builder description and the attachment are visible.
    cy.contains('Edited text.').should('be.visible');
    cy.get('#e2e-project-page-description-section')
      .contains('example.pdf')
      .should('be.visible');
  });
});
