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
      const projectDescription = randomString();
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
  it('edits project description in content builder', () => {
    cy.get('#e2e-toggle-enable-content-builder')
      .find('input')
      .click({ force: true });
    cy.get('#e2e-content-builder-link').click();

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

    cy.wait(3000);

    // Edit each component if possible
    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.');

    cy.wait(3000);
    // Save content
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(3000);
    // Save content
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait(3000);
  });
  it('checks proper error status', () => {
    console.log('Temp');
  });
  it('checks that live content is displayed properly', () => {
    // Navigate to live project page
    cy.get('[data-testid="goBackButton"] .button', {
      withinSubject: null,
    }).click();
    cy.get('#to-project').click();

    // Check builder content is displayed
    cy.contains('Edited text.').should('be.visible');
  });
  it('deletes components', () => {
    console.log('Temp');
  });
  it('confirms live content is displayed properly', () => {
    console.log('Temp');
  });
});
