import { randomString } from '../../support/commands';

describe('Project description builder language switch', () => {
  let projectId = '';
  let projectSlug = '';

  const switchLocale = (locale: string) => {
    cy.apiUpdateCurrentUser({ locale: locale });
    cy.reload();
  };

  before(() => {
    cy.setAdminLoginCookie();
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
        // participationMethod: 'ideation',
        assigneeId: userId,
      }).then((project) => {
        projectSlug = projectTitle;
        projectId = project.body.data.id;
        cy.apiToggleProjectDescriptionBuilder({ projectId }).then(() => {
          cy.visit(
            `/admin/project-description-builder/projects/${projectId}/description`
          );
        });
      });
    });
  });

  beforeEach(() => {
    switchLocale('en');
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.visit(`/projects/${projectSlug}`);
    switchLocale('en');
    cy.apiRemoveProject(projectId);
  });

  it('handles language specific content correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    // EN
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('.e2e-text-box').click('center');
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Language 1 text.', { force: true });
    cy.wait(1000);
    // NL
    cy.get('.e2e-localeswitcher.nl-BE').click();
    cy.get('.ql-editor').clear().type('Language 2 text.', { force: true });
    cy.wait(1000);
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    // Confirm correct content on live page
    cy.visit(`/projects/${projectSlug}`);
    switchLocale('en');
    cy.contains('Language 1 text.').should('exist');
    switchLocale('nl-BE');
    cy.contains('Language 2 text.').should('exist');
  });

  it('deletes language specific content correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );

    // Delete content
    cy.get('.e2e-text-box').click({ force: true });
    cy.get('#e2e-delete-button').click({ force: true });

    // Confirm correct content on live page
    cy.visit(`/projects/${projectSlug}`);
    switchLocale('en');
    cy.contains('Language 1 text.').should('not.exist');
    switchLocale('nl-BE');
    cy.contains('Language 2 text.').should('not.exist');
  });
});
