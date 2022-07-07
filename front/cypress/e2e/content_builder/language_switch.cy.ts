import { randomString } from '../../support/commands';

describe('Content builder language switch', () => {
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
        projectSlug = projectTitle;
        projectId = project.body.data.id;
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
    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-language-dropdown-toggle').click({ force: true });
    cy.contains('English').click({ force: true });
    cy.apiRemoveProject(projectId);
  });

  it('handles language specific content correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );

    // EN
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('#e2e-text-box').click('center');
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Language 1 text.', { force: true });
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    // NL-BE
    cy.get('.e2e-language-dropdown-toggle').click({ force: true });
    cy.get('.nl-BE').click({ force: true });
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('#e2e-text-box').click('center');
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Language 2 text.', { force: true });
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    // Confirm correct content on live page
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Language 1 text.').should('exist');
    cy.get('.e2e-language-dropdown-toggle').click({ force: true });
    cy.contains('Nederlands').click({ force: true });
    cy.contains('Language 2 text.').should('exist');
    cy.get('.e2e-language-dropdown-toggle').click({ force: true });
    cy.contains('English').click({ force: true });
  });

  it('deletes language specific content correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );

    cy.visit(`/admin/content-builder/projects/${projectId}/description`);

    // Delete content from languages
    cy.get('#e2e-text-box').click({ force: true });
    cy.get('#e2e-delete-button').click({ force: true });

    // NL-BE
    cy.get('.nl-BE').click();
    cy.get('#e2e-text-box').click({ force: true });
    cy.get('#e2e-delete-button').click({ force: true });
    cy.get('#e2e-content-builder-topbar-save').click({ force: true });
    cy.wait('@saveContentBuilder');

    // Confirm correct content on live page
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Language 1 text.').should('not.exist');
    cy.get('.e2e-language-dropdown-toggle').click({ force: true });
    cy.contains('Nederlands').click({ force: true });
    cy.contains('Language 2 text.').should('not.exist');
  });
});
