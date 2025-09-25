import { randomString } from '../../../support/commands';

describe('Project description builder Info & Accordions section', () => {
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
            `/admin/project-description-builder/projects/${projectId}/description`
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

  it('handles Info & Accordions section correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.get('#e2e-draggable-info-accordions').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    // Edit text component
    cy.get('div.e2e-text-box').first().click();
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Edited text.', { force: true });

    // Edit an accordion component
    cy.get('.e2e-accordion').first().click({ force: true });
    cy.get('#default-open-toggle').should('exist');
    cy.get('#default-open-toggle').click({ force: true });

    cy.wait(1000);
    // Add text component inside the accordion
    cy.get('#e2e-draggable-text').dragAndDrop('.e2e-single-column', {
      position: 'inside',
    });

    // Edit the text component inside the accordion
    cy.get('div.e2e-text-box').last().click({ force: true });
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Accordion text.', { force: true });
    cy.contains('Accordion text.').should('be.visible');

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);

    cy.contains('Edited text.').should('be.visible');
    cy.contains('Accordion text.').should('be.visible');
    cy.contains('About').should('be.visible');
  });

  it('deletes Info & Accordions section correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );

    // First, create an Info & Accordions section to delete
    cy.get('#e2e-draggable-info-accordions').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    // Edit text component
    cy.get('div.e2e-text-box').first().click();
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Text to be deleted.', { force: true });

    // Edit an accordion component
    cy.get('.e2e-accordion').first().click({ force: true });
    cy.get('#default-open-toggle').should('exist');
    cy.get('#default-open-toggle').click({ force: true });

    cy.wait(1000);
    // Add text component inside the accordion
    cy.get('#e2e-draggable-text').dragAndDrop('.e2e-single-column', {
      position: 'inside',
    });

    // Edit the text component inside the accordion
    cy.get('div.e2e-text-box').last().click({ force: true });
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Accordion text to be deleted.', { force: true });

    // Save the section first
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    // Now delete the Info & Accordions section
    cy.get('.e2e-two-column').first().click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    // Verify the section and its content are deleted
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Text to be deleted.').should('not.exist');
    cy.contains('Accordion text to be deleted.').should('not.exist');
    cy.contains('About').should('not.exist');
  });
});
