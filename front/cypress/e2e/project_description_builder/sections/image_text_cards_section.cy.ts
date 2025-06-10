import { randomString } from '../../../support/commands';

describe('Project description builder Image Text Cards section', () => {
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

  it('handles Image Text Cards section correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.get('#e2e-draggable-image-text-cards').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    // Edit a text component
    cy.get('div.e2e-text-box').first().click();
    cy.get('.ql-editor').click();
    cy.get('.ql-editor').type('Edited text.', { force: true });

    // Edit image components
    cy.get('div.e2e-image').eq(0).parent().click();
    cy.get('input[type="file"]').attachFile('icon.png');
    cy.get('#imageAltTextInput').click().clear().type('Image alt text.');
    cy.get('[alt="Image alt text."]').should('exist');

    cy.get('div.e2e-image').eq(1).parent().click();
    cy.get('input[type="file"]').attachFile('icon.png');
    cy.get('#imageAltTextInput').click().clear().type('Image alt text.');
    cy.get('[alt="Image alt text."]').should('exist');

    cy.get('div.e2e-image').eq(2).parent().click();
    cy.get('input[type="file"]').attachFile('icon.png');
    cy.get('#imageAltTextInput').click().clear().type('Image alt text.');
    cy.get('[alt="Image alt text."]').should('exist');

    // Save
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('be.visible');
    cy.get('[alt="Image alt text."]').should('exist');
  });

  it('deletes Image Text Cards section correctly', () => {
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(
      `/admin/project-description-builder/projects/${projectId}/description`
    );

    cy.get('.e2e-two-column').first().click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('.e2e-two-column').first().click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('.e2e-two-column').first().click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('not.exist');
    cy.get('[alt="Image alt text."]').should('not.exist');
  });
});
