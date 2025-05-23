import { randomString } from '../../../support/commands';

describe('Project description builder Iframe component', () => {
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
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = projectTitle;
        cy.apiToggleProjectDescriptionBuilder({ projectId }).then(() => {
          cy.visit(
            `/admin/project-description-builder/projects/${projectId}/description`
          );
        });
      });
    });
  });
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles Iframe component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    // Add iframe with valid url
    cy.get('#e2e-draggable-iframe').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('#e2e-content-builder-iframe-url-input').type(
      // Typeform survey created in CitizenLab Methods Squad workspace specifically for e2e
      'https://citizenlabco.typeform.com/to/cZtXQzTf'
    );

    // Confirms that iframe displays correctly on live page
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');
    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-content-builder-iframe-component').should('exist');
  });

  it('handles Iframe errors correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );
    cy.get('.e2e-content-builder-iframe-component').click('center', {
      force: true,
    });

    // Try invalid URL
    cy.get('#e2e-content-builder-iframe-url-input')
      .clear()
      .type('https://citizen')
      .blur();
    cy.get('.e2e-error-message').should('be.visible');
    // Check that save is disabled
    cy.contains('Save').should('have.attr', 'aria-disabled', 'true');
    // Check that red border is present
    cy.get('.e2e-render-node')
      .last()
      .should('have.css', 'border-color', 'rgb(214, 22, 7)');

    // Type valid URL
    cy.get('#e2e-content-builder-iframe-url-input')
      .clear()
      .type('https://citizenlabco.typeform.com/to/cZtXQzTf')
      .blur();
    // Check that save is enabled
    cy.contains('Save').should('be.enabled');
    // Check that red border is gone
    cy.get('.e2e-render-node')
      .last()
      .should('have.css', 'border-color', 'rgb(4, 77, 108)');
  });

  it('deletes Iframe component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.get('.e2e-content-builder-iframe-component').should('exist');

    cy.get('#e2e-content-builder-frame').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-content-builder-iframe-component').should('not.exist');
  });
});
