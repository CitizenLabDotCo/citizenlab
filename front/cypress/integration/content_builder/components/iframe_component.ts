import { randomString } from '../../../support/commands';

describe('Content builder Iframe component', () => {
  let projectId = '';
  let projectSlug = '';

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
      // Typeform survey created in CitizenLab Methods Squad workspace specifically for e2e
      'https://citizenlabco.typeform.com/to/cZtXQzTf'
    );

    // Confirms that iframe displays correctly on live page
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.visit(`/projects/${projectSlug}`);
    cy.wait(2000); // Load iframe
    getIframeBody().get('h1').first().should('exist');
  });

  it('handles Iframe errors correctly', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.wait(3000); // Load iframe
    cy.get('#e2e-content-builder-frame').click('center');

    // Try invalid URL
    cy.get('#e2e-iframe-url').clear().type('https://citizen');
    cy.contains('Must provide a valid URL.').should('be.visible');
    // Check that save is disabled
    cy.contains('Save').should('be.disabled');
    // Check that red border is present
    cy.get('.e2eRenderNode')
      .last()
      .should('have.css', 'border-color', 'rgb(214, 22, 7)');

    // Try URL for non-permitted source
    cy.get('#e2e-iframe-url').clear().type('https://www.citizenlab.co');
    cy.contains(
      'You cannot embed content from this website for security reasons'
    ).should('be.visible');
    // Check that save is disabled
    cy.contains('Save').should('be.disabled');
    // Check that red border is present
    cy.get('.e2eRenderNode')
      .last()
      .should('have.css', 'border-color', 'rgb(214, 22, 7)');

    // Type valid URL
    cy.get('#e2e-iframe-url')
      .clear()
      .type('https://citizenlabco.typeform.com/to/cZtXQzTf');
    // Check that save is enabled
    cy.contains('Save').should('be.enabled');
    // Check that red border is gone
    cy.get('.e2eRenderNode')
      .last()
      .should('have.css', 'border-color', 'rgb(4, 77, 108)');
  });

  it('deletes Iframe component correctly', () => {
    cy.get('#e2e-iframe').should('exist');

    cy.get('#e2e-content-builder-frame').click();
    cy.get('#e2e-delete-button').click();
    cy.wait(2000); // Wait for iframe deletion
    cy.get('#e2e-content-builder-topbar-save').click();

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-iframe').should('not.exist');
  });
});
