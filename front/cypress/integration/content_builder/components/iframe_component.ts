import { randomString } from '../../../support/commands';

describe('Content builder Iframe component', () => {
  let projectId = '';
  let projectSlug = '';

  // Based on:
  // https://nicknish.co/blog/cypress-targeting-elements-inside-iframes
  const getIframeBody = () => {
    return cy
      .get('iframe')
      .its('0.contentDocument')
      .should('exist')
      .its('body')
      .should('not.be.undefined')
      .then(cy.wrap);
  };

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

  it('handles Iframe component correctly', () => {
    // Add iframe with valid url
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-draggable-iframe').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });
    cy.get('#e2e-iframe-url').type(
      // Typeform survey created in CitizenLab Methods Squad workspace for e2e
      'https://citizenlabco.typeform.com/to/cZtXQzTf'
    );

    // Confirms that iframe displays correctly on live page
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(2000); // Wait for iframe to load
    getIframeBody().get('h1').first().should('exist');
  });

  it('handles Iframe errors correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    // Displays incorrect url message
    // Makes save unclickable

    // Displays source not permitted message
    // Makes save unclickable

    // Navigate away from iframe component
    // Save is still unclickable
    // Shows red border always around the components causing the error

    // Type valid URL, ensure border and error are gone, and save can be clicked
  });

  it('deletes Iframe component correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.get('#e2e-iframe').should('exist');

    cy.get('#e2e-content-builder-frame').click();
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-iframe').should('not.exist');
  });
});
