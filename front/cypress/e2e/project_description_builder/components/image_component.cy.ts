import { randomString } from '../../../support/commands';

describe('Project description builder Image component', () => {
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
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles Image component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.get('#e2e-draggable-image').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('.e2e-image').parent().click();
    cy.get('input[type="file"]').attachFile('icon.png');
    cy.get('#imageAltTextInput')
      .click()
      .focus()
      .clear()
      .type('Image alt text.');

    cy.get('[alt="Image alt text."]').should('exist');
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('[alt="Image alt text."]').should('exist');
  });

  it('deletes Image component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );

    cy.get('.e2e-image').parent().click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('[alt="Image alt text."]').should('not.exist');
  });
});
