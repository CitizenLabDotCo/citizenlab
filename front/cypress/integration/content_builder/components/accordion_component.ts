import { randomString } from '../../../support/commands';

describe('Content builder Accordion component', () => {
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

  it('displays Accordion component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-accordion').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Accordion title').should('be.visible');
  });

  it('handles Accordion open by deafult correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);

    cy.get('#e2e-accordion').click();
    cy.get('#default-open-toggle').find('input').click({ force: true });
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('be.visible');
  });

  it('deletes Accordion component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);

    cy.get('#e2e-accordion').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('not.exist');
  });
});
