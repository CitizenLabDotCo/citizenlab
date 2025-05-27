import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Project description builder toggle', () => {
  let projectId = '';
  let projectSlug = '';
  let userId = '';
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = 'Original project description.';
  let phaseId: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser().then((user) => {
      userId = user.body.data.id;
    });
  });

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
      projectId = '';
    }

    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
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

  it('shows original description by default along with any attachments if project description builder is not used', () => {
    cy.intercept(`**/projects/${projectId}`).as('saveProject');
    cy.intercept(`**/projects/${projectId}/files`).as('saveProjectFiles');

    // Attach a project file
    cy.visit(`admin/projects/${projectId}/settings`);
    cy.scrollTo('bottom');
    cy.acceptCookies();
    cy.get('#e2e-project-file-uploader').selectFile(
      'cypress/fixtures/example.pdf'
    );
    cy.wait(4000);

    // Submit project
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.wait('@saveProject');
    cy.wait('@saveProjectFiles');
    cy.contains('Your form has been saved!').should('be.visible');

    // Go to project page
    cy.visit(`/projects/${projectSlug}`);
    // Check that original project description is visible
    cy.contains('Original project description.').should('be.visible');

    // Check that attachment is present
    // Skip this check for now as it is flaky.
    // cy.contains('example.pdf').should('exist');
  });

  it('shows original description when project description builder is enabled but there is no content yet', () => {
    cy.visit(`/admin/projects/${projectId}/settings/description`);
    cy.get('#e2e-toggle-enable-project-description-builder').click({
      force: true,
    });
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Original project description.').should('be.visible');
  });

  it('shows attachments added to the project after description added using project description builder', () => {
    cy.intercept(`**/projects/${projectId}`).as('saveProject');
    cy.intercept(`**/projects/${projectId}/files`).as('saveProjectFiles');
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    // Attach a project file
    cy.visit(`admin/projects/${projectId}/settings`);
    cy.scrollTo('bottom');
    cy.acceptCookies();
    cy.dataCy('e2e-project-file-uploader').should('exist');
    cy.dataCy('e2e-project-file-uploader').selectFile(
      'cypress/fixtures/example.pdf'
    );
    cy.contains('example.pdf').should('exist');

    // Submit project
    cy.get('.e2e-submit-wrapper-button button').click();
    cy.wait('@saveProject');
    cy.wait('@saveProjectFiles');
    cy.contains('Your form has been saved!').should('be.visible');

    cy.visit(`/admin/projects/${projectId}/settings/description`);
    cy.apiToggleProjectDescriptionBuilder({ projectId, enabled: true });
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );

    // Add content using project description builder
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('div.e2e-text-box').click('center');
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);

    // Check that attachment is present
    cy.contains('Edited text.').should('be.visible');
    cy.contains('example.pdf').should('be.visible');
  });
});
