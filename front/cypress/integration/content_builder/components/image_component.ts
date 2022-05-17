import { randomString } from '../../../support/commands';

describe('Content builder Image component', () => {
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
        cy.visit(`/admin/projects/${projectId}/description`);
        cy.get('#e2e-toggle-enable-content-builder')
          .find('input')
          .click({ force: true });
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
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-single-column').should('be.visible');

    cy.get('#e2e-draggable-image').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-image').parent().click();
    cy.get('input[type="file"]').attachFile('icon.png');
    cy.get('#imageAltTextInput').click().type('Image alt text.');

    cy.get('[alt="Image alt text."]').should('exist');
    cy.get('#e2e-content-builder-topbar-save').click().wait(1000);

    cy.visit(`/projects/${projectSlug}`);
    cy.get('[alt="Image alt text."]').should('exist');
  });

  it('deletes Image component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-single-column').should('be.visible');

    cy.get('#e2e-image').parent().click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-single-column').should('be.visible');
    cy.get('[alt="Image alt text."]').should('not.exist');
  });
});
