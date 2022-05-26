import { randomString } from '../../../support/commands';

describe('Content builder Container component', () => {
  let projectId = '';
  let projectSlug = '';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = 'Original project description.';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        participationMethod: 'ideation',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = projectTitle;
        cy.visit(`/admin/projects/${projectId}/description`);
        cy.get('#e2e-toggle-enable-content-builder')
          .find('input')
          .click({ force: true });
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles Container component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-single-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    /* Check container rules */
    // Non-permitted components
    cy.get('#e2e-draggable-single-column').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-two-column').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-three-column').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });

    cy.get('#e2e-single-column').should('have.length', 1); // Only original container exists
    cy.get('#e2e-two-column').should('not.exist');
    cy.get('#e2e-three-column').should('not.exist');
    cy.get('#e2e-content-builder-topbar-save').click();

    // Permitted components
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-about-box').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-iframe').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-image').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });

    cy.get('#e2e-text-box').should('exist');
    cy.get('#e2e-about-box').should('exist');
    cy.get('#e2e-iframe').should('exist');
    cy.get('#e2e-image').should('exist');

    // Check column exists on live page
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-single-column').should('exist');
  });

  it('deletes Container component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-single-column').should('be.visible');

    cy.get('#e2e-single-column').click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-single-column').should('not.exist');
  });
});
