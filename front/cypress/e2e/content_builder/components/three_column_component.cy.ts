import { randomString } from '../../../support/commands';

describe('Content builder Three Column component', () => {
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

  it('handles Three Column component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-three-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    /* Check container rules */
    // Non-permitted components
    cy.get('#e2e-draggable-two-column').dragAndDrop('#e2e-three-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-three-column').dragAndDrop('#e2e-three-column', {
      position: 'inside',
    });

    cy.get('div#e2e-single-column').should('have.length', 3); // Only original container columns
    cy.get('#e2e-two-column').should('not.exist');
    cy.get('#e2e-three-column').should('have.length', 1); // Only original container

    // Permitted components added to all columns
    cy.get('#e2e-draggable-about-box').dragAndDrop('div#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-text').dragAndDrop('div#e2e-single-column', {
      position: 'inside',
    });

    cy.get('div#e2e-text-box').should('have.length', 3);
    cy.get('div#e2e-about-box').should('have.length', 3);

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    // Check column and elements exist on page
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-three-column').should('exist');
    cy.get('div#e2e-text-box').should('have.length', 3);
    cy.get('div#e2e-about-box').should('have.length', 3);
  });

  it('deletes Three Column component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-three-column').should('be.visible');

    cy.get('#e2e-three-column').click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-three-column').should('not.exist');
  });
});
