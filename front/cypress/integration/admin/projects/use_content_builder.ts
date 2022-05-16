import { randomString } from '../../../support/commands';

describe('Admin: add project and edit description', () => {
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
        cy.visit(`/projects/${projectSlug}`);
      });
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('shows original description by default', () => {
    cy.contains('Original project description.').should('be.visible');
  });

  it('shows original description when content builder is enabled but there is no content yet', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.get('#e2e-toggle-enable-content-builder')
      .find('input')
      .click({ force: true });
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Original project description.').should('be.visible');
  });

  it('handles Image component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-image').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-image').parent().click();
    cy.get('input[type="file"]').attachFile('icon.png');
    cy.get('#imageAltTextInput').type('Image alt text.');

    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('[alt="Image alt text."]').should('exist');
  });

  it('deletes Image component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-image').parent().click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('[alt="Image alt text."]').should('not.exist');
  });

  it('handles Text component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.');

    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('be.visible');
  });

  it('deletes Text component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-text-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('not.exist');
  });

  it('handles About component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-about-box').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-about-box').should('exist');
  });

  it('deletes About component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-about-box').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-about-box').should('not.exist');
  });
});
