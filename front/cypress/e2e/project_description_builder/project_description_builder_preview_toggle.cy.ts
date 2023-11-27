import { randomString } from '../../support/commands';
import moment = require('moment');

describe('Project description builder preview', () => {
  let projectId = '';
  let phaseId: string;

  const getIframeBody = () => {
    // get the document
    return cy
      .get('iframe')
      .its('0.contentDocument')
      .should('exist')
      .its('body')
      .should('not.be.undefined')
      .then(cy.wrap);
  };

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = 'Original project description.';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        assigneeId: userId,
      })
        .then((project) => {
          projectId = project.body.data.id;
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
          cy.visit(`/admin/projects/${projectId}/settings/description`);
          cy.get('#e2e-toggle-enable-project-description-builder').click({
            force: true,
          });
        });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('shows saved description if there is no draft content', () => {
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );
    cy.wait(10000);
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.get('#e2e-preview-toggle').click({ force: true });

    getIframeBody().contains('Edited text.').should('be.visible');
  });

  it('shows draft content when it exists', () => {
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.wait(10000);
    cy.get('#e2e-text-box').should('exist');
    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Another edited text.', { force: true });

    cy.get('#e2e-preview-toggle').click({ force: true });

    getIframeBody().contains('Another edited text.').should('be.visible');
  });

  it('allows user to navigate between mobile and desktop preview and see content in both', () => {
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.wait(5000);
    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Sample text.', { force: true });

    cy.get('#e2e-preview-toggle').click({ force: true });

    getIframeBody().contains('Sample text.').should('be.visible');
    cy.get('[data-cy="mobile-preview-iframe"]').should('exist');

    cy.get('#e2e-desktop-preview').click({ force: true });

    getIframeBody().contains('Sample text.').should('be.visible');
    cy.get('[data-cy="desktop-preview-iframe"]').should('exist');
  });
});
