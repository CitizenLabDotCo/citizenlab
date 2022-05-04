import { randomString } from '../../../support/commands';

describe('Admin: add project and edit description', () => {
  let projectId = '';

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });
  after(() => {
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
    // Add a container component
    cy.wait(1000);
    cy.get('#e2e-draggable-single-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    // Check that container components cannot be dragged into other containers
    cy.wait(1000);
    cy.get('#e2e-draggable-about-box').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-two-column').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-three-column').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });

    // The image component can't be tested as it opens up a local file picker. Or is there another way to do this? I
    // don't see any examples in other e2e tests.

    cy.wait(2000);
    cy.get('#e2e-two-column').should('not.exist');
    cy.get('#e2e-three-column').should('not.exist');
    cy.wait(1000);

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

    cy.get('#e2e-about-box').click();
    cy.get('#e2e-delete-button').click();

    cy.get('#e2e-single-column').click();
    cy.get('#e2e-delete-button').click();

    // Save content
    cy.wait(2000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(2000);

    // Should I visit the live page to confirm that it is now blank?
  });
});
