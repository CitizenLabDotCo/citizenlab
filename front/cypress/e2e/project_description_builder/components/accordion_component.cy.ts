import { randomString } from '../../../support/commands';

describe('Project description builder Accordion component', () => {
  let projectId = '';
  let projectSlug = '';

  beforeEach(() => {
    cy.setAdminLoginCookie();
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
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
            `/admin/description-builder/projects/${projectId}/description`
          );
        });
      });
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('displays Accordion component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.get('#e2e-draggable-accordion').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    cy.get('.e2e-accordion').click({ force: true });
    cy.get('#accordionTitleId').type('Accordion title', { force: true });
    cy.get('#default-open-toggle').click({ force: true });

    cy.wait(1000);
    // Add text component inside the accordion
    cy.get('#e2e-draggable-text').dragAndDrop('.e2e-single-column', {
      position: 'inside',
    });

    // Edit the text component inside the accordion
    cy.get('div.e2e-text-box').last().click({ force: true });
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Accordion content.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Accordion title').should('be.visible');
  });

  it('handles Accordion open by default correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(`/admin/description-builder/projects/${projectId}/description`);

    cy.get('#e2e-draggable-accordion').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    // Open the accordion to show its content area
    cy.get('.e2e-accordion').click({ force: true });
    cy.get('#default-open-toggle').click({ force: true });

    cy.wait(1000);
    cy.get('#e2e-draggable-text').dragAndDrop('.e2e-single-column', {
      position: 'inside',
    });

    // Edit the text component inside the accordion
    cy.get('div.e2e-text-box').last().click({ force: true });
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('be.visible');
  });

  it('deletes Accordion component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(`/admin/description-builder/projects/${projectId}/description`);

    // First, create an accordion to delete
    cy.get('#e2e-draggable-accordion').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    cy.get('.e2e-accordion').click({ force: true });
    cy.get('#accordionTitleId').type('Accordion to delete', { force: true });
    cy.get('#default-open-toggle').click({ force: true });

    cy.wait(1000);
    // Add text component inside the accordion
    cy.get('#e2e-draggable-text').dragAndDrop('.e2e-single-column', {
      position: 'inside',
    });

    // Edit the text component inside the accordion
    cy.get('div.e2e-text-box').last().click({ force: true });
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Text to be deleted', { force: true });

    // Save the accordion first
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);

    cy.get('.e2e-accordion').should('be.visible');
    cy.contains('Accordion to delete').should('be.visible');
    cy.contains('Text to be deleted').should('be.visible');

    cy.visit(`/admin/description-builder/projects/${projectId}/description`);
    cy.wait(1000);

    // Now delete the accordion
    cy.get('.e2e-accordion').should('be.visible');

    // Try clicking multiple times to ensure selection. Temporarily fix for flakiness.
    cy.get('.e2e-accordion').click({ force: true });
    cy.wait(500);
    cy.get('.e2e-accordion').click({ force: true });

    // Wait for the sidebar/delete button to appear
    cy.get('#e2e-delete-button', { timeout: 10000 })
      .should('exist')
      .and('be.visible');
    cy.get('#e2e-delete-button').click({ force: true });
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    // Verify the accordion and its content are deleted
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Accordion to delete').should('not.exist');
    cy.contains('Text to be deleted').should('not.exist');
  });
});
