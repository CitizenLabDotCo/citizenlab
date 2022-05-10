import { randomString } from '../../../support/commands';

describe('Admin: add project and edit description', () => {
  let projectId = '';
  let projectSlug = '';

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
        projectSlug = projectTitle;
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
    // Check container rules for single column
    cy.get('#e2e-draggable-single-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-two-column').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-three-column').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-text-box').should('exist');
    cy.get('#e2e-two-column').should('not.exist');
    cy.get('#e2e-three-column').should('not.exist');
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-single-column').click();
    cy.get('#e2e-delete-button').click();

    // Check container rules for two column
    cy.get('#e2e-draggable-two-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-single-column').dragAndDrop('#e2e-two-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-three-column').dragAndDrop('#e2e-two-column', {
      position: 'inside',
    });

    // Add text boxes to both columns
    let draggableText = cy.get('#e2e-draggable-text');
    draggableText.dragAndDrop('div#e2e-single-column');

    cy.get('div#e2e-text-box').should('have.length', 2);
    cy.get('#e2e-single-column').should('have.length', 1);
    cy.get('#e2e-three-column').should('not.exist');
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-two-column').click();
    cy.get('#e2e-delete-button').click();

    // Check container rules for three column
    cy.get('#e2e-draggable-three-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-single-column').dragAndDrop('#e2e-three-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-two-column').dragAndDrop('#e2e-three-column', {
      position: 'inside',
    });

    // Add text boxes to all three columns
    draggableText = cy.get('#e2e-draggable-text');
    draggableText.dragAndDrop('div#e2e-single-column');

    cy.get('div#e2e-text-box').should('have.length', 3);
    cy.get('div#e2e-single-column').should('have.length', 3);
    cy.get('#e2e-two-column').should('not.exist');
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-three-column').click();
    cy.get('#e2e-delete-button').click();

    // Confirm image component can be added to and deleted from frame
    cy.get('#e2e-draggable-image').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('#e2e-image').should('exist');
    cy.get('#e2e-delete-button').click();

    // Add text box and container, then nest the text box within the container
    cy.get('#e2e-draggable-single-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('#e2e-text-box').dragAndDrop('#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-single-column').within(() => {
      cy.get('#e2e-text-box').should('exist');
    });
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-single-column').click();
    cy.get('#e2e-delete-button').click();

    // Drop remaining components into frame
    cy.get('#e2e-draggable-about-box').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    // Edit components where possible
    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.');

    // Save content
    cy.get('#e2e-content-builder-topbar-save').click();
  });

  it('checks that live content is displayed properly', () => {
    // Navigate to live project page
    cy.get('[data-testid="goBackButton"] .button', {
      withinSubject: null,
    }).click();
    cy.get('#to-project').click();

    // Check that content is correct
    cy.contains('Edited text.').should('be.visible');
    cy.get('#e2e-about-box').should('exist');
  });

  it('deletes from description in content builder', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);

    // Delete components
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();

    cy.get('#e2e-about-box').click();
    cy.get('#e2e-delete-button').click();

    // Save content
    cy.get('#e2e-content-builder-topbar-save').click();
  });

  it('checks that deleted content is displayed properly', () => {
    // Navigate to live project page
    cy.visit(`/projects/${projectSlug}`);

    // Check that content is correct
    cy.get('#e2e-text-box').should('not.exist');
    cy.get('#e2e-about-box').should('not.exist');
  });
});
