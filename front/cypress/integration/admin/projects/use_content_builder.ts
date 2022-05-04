import { randomString } from '../../../support/commands';

describe('Admin: add project and edit description', () => {
  let projectId = '';

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });
  after(() => {
    // Cleanup
    cy.apiRemoveProject(projectId);
  });

  it('creates a sample project', () => {
    cy.visit('/admin/projects/');
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
        cy.visit(`/admin/projects/${projectId}/description`);
      });
    });
  });

  it('navigates to content builder', () => {
    cy.get('#e2e-toggle-enable-content-builder')
      .find('input')
      .click({ force: true });
    cy.get('#e2e-content-builder-link').click();
  });

  it('adds to description in content builder', () => {
    // Drag and drop each component into the page
    cy.get('#e2e-draggable-about-box').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.wait(1000);
    cy.get('#e2e-draggable-single-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-two-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-three-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.wait(2000);

    // Edit components if possible
    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.');

    // Save content
    cy.wait(2000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(2000);
  });

  it('checks that live content is displayed properly', () => {
    // Navigate to live project page
    cy.get('[data-testid="goBackButton"] .button', {
      withinSubject: null,
    }).click();
    cy.get('#to-project').click();
    cy.contains('Edited text.').should('be.visible');
  });

  it('deletes from description in content builder', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);

    // Delete components
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();

    cy.get('#e2e-two-column').click();
    cy.get('#e2e-delete-button').click();

    cy.get('#e2e-three-column').click();
    cy.get('#e2e-delete-button').click();

    cy.get('#e2e-single-column').click();
    cy.get('#e2e-delete-button').click();

    cy.get('#e2e-about-box').click();
    cy.get('#e2e-delete-button').click();

    // Save content
    cy.wait(2000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(2000);
  });
});
