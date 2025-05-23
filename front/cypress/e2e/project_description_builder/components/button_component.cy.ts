import { randomString } from '../../../support/commands';

describe('Project description builder Button component', () => {
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
  });
  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles Button component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    cy.get('#e2e-draggable-button').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    // Change button text
    cy.get('#e2e-button-text-input').clear().type('New Button Title');

    // Input URL
    cy.get('#e2e-button-url-input').clear().type('https://www.google.com');

    // Change style
    cy.get('#style-primary').click({ force: true });
    cy.get('.e2e-button').get('button').should('have.class', 'primary');
    cy.get('#style-secondary').click({ force: true });
    cy.get('.e2e-button').get('a').should('have.class', 'secondary-outlined');

    // Change alignment
    cy.get('.e2e-button')
      .parent()
      .invoke('css', 'justify-content')
      .should('equal', 'flex-start');
    cy.get('#alignment-center').click({ force: true });
    cy.get('.e2e-button')
      .parent()
      .invoke('css', 'justify-content')
      .should('equal', 'center');
    cy.get('#alignment-right').click({ force: true });
    cy.get('.e2eBuilderSettingsClose').click({ force: true });
    cy.get('.e2e-button')
      .parent()
      .invoke('css', 'justify-content')
      .should('equal', 'flex-end');

    // Confirms that button displays and functions correctly on live page
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('New Button Title').should('exist');
  });

  it('deletes Button component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );

    cy.get('.e2e-button').should('exist');
    cy.get('.e2e-button').parent().click({ force: true });
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-button').should('not.exist');
  });
});
