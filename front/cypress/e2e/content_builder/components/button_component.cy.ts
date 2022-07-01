import { randomString } from '../../../support/commands';

describe('Content builder Button component', () => {
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

  it('handles Button component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
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
    cy.get('#e2e-button').get('button').should('have.class', 'primary');
    cy.get('#style-secondary').click({ force: true });
    cy.get('#e2e-button').get('button').should('have.class', 'secondary');

    // Change alignment
    cy.get('#e2e-button')
      .parent()
      .invoke('css', 'justify-content')
      .should('equal', 'flex-start');
    cy.get('#alignment-center').click({ force: true });
    cy.get('#e2e-button')
      .parent()
      .invoke('css', 'justify-content')
      .should('equal', 'center');
    cy.get('#alignment-right').click({ force: true });
    cy.get('.e2eBuilderSettingsClose').click({ force: true });
    cy.get('#e2e-button')
      .parent()
      .invoke('css', 'justify-content')
      .should('equal', 'flex-end');

    // Confirms that button displays and functions correctly on live page
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('New Button Title').should('exist');
    cy.contains('New Button Title').click({ force: true });
    cy.location().should((loc) => {
      expect(loc.href).to.eq('https://www.google.com/');
    });
  });

  it('deletes Button component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);

    cy.get('#e2e-button').should('exist');
    cy.get('#e2e-button').parent().click({ force: true });
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-button').should('not.exist');
  });
});
