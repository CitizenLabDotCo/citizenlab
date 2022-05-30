import { randomString } from '../../../support/commands';

describe('Content builder Two Column component', () => {
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

  it('handles Two Column component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-two-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    /* Check container rules */
    // Non-permitted components
    cy.get('#e2e-draggable-single-column').dragAndDrop('#e2e-two-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-two-column').dragAndDrop('#e2e-two-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-three-column').dragAndDrop('#e2e-two-column', {
      position: 'inside',
    });

    cy.get('div#e2e-single-column').should('have.length', 2); // Only original container columns
    cy.get('#e2e-two-column').should('have.length', 1); // Only original container
    cy.get('#e2e-three-column').should('not.exist');

    // Permitted components added to both columns
    cy.get('#e2e-draggable-text').dragAndDrop('div#e2e-single-column', {
      position: 'inside',
    });
    cy.get('#e2e-draggable-about-box').dragAndDrop('div#e2e-single-column', {
      position: 'inside',
    });

    cy.get('div#e2e-text-box').should('have.length', 2);
    cy.get('div#e2e-about-box').should('have.length', 2);

    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-two-column').should('exist');
    cy.get('div#e2e-text-box').should('have.length', 2);
    cy.get('div#e2e-about-box').should('have.length', 2);
  });

  it('deletes Two Column component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-two-column').should('be.visible');

    cy.get('#e2e-two-column').click('top');
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-two-column').should('not.exist');
  });
});
