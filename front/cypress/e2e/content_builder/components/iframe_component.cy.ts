import { randomString } from '../../../support/commands';

describe('Content builder Iframe component', () => {
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
        cy.apiEnableContentBuilder({ projectId }).then(() => {
          cy.visit(`/admin/content-builder/projects/${projectId}/description`);
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

  it('handles Iframe component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
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
    cy.wait('@saveContentBuilder');
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-content-builder-iframe-component').should('exist');
  });

  it('handles Iframe errors correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-content-builder-iframe-component').click('center', {
      force: true,
    });

    // Try invalid URL
    cy.get('#e2e-content-builder-iframe-url-input')
      .clear()
      .type('https://citizen');
    cy.contains('Must provide a valid URL.').should('be.visible');
    // Check that save is disabled
    cy.contains('Save').should('be.disabled');
    // Check that red border is present
    cy.get('.e2e-render-node')
      .last()
      .should('have.css', 'border-color', 'rgb(214, 22, 7)');

    // Try URL for non-permitted source
    cy.get('#e2e-content-builder-iframe-url-input')
      .clear()
      .type('https://www.citizenlab.co');
    cy.contains(
      'Sorry, this content could not be embedded. Visit our support page to learn more.'
    ).should('be.visible');
    // Check that save is disabled
    cy.contains('Save').should('be.disabled');
    // Check that red border is present
    cy.get('.e2e-render-node')
      .last()
      .should('have.css', 'border-color', 'rgb(214, 22, 7)');

    // Type valid URL
    cy.get('#e2e-content-builder-iframe-url-input')
      .clear()
      .type('https://citizenlabco.typeform.com/to/cZtXQzTf');
    // Check that save is enabled
    cy.contains('Save').should('be.enabled');
    // Check that red border is gone
    cy.get('.e2e-render-node')
      .last()
      .should('have.css', 'border-color', 'rgb(4, 77, 108)');
  });

  it('deletes Iframe component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );
    cy.get('#e2e-content-builder-iframe-component').should('exist');

    cy.get('#e2e-content-builder-frame').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-content-builder-iframe-component').should('not.exist');
  });
});
