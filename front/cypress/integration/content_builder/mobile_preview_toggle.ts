import { randomString } from '../../support/commands';

describe('Content builder mobile preview', () => {
  let projectId = '';

  const getIframeBody = () => {
    // get the document
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

  it('shows saved description if there is no draft content', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.wait(10000);
    cy.get('#e2e-draggable-single-column').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.get('#e2e-mobile-preview-toggle').find('input').click({ force: true });

    getIframeBody().contains('Edited text.').should('be.visible');
  });

  it('shows saved description if there is no draft content', () => {
    cy.visit(`/admin/content-builder/projects/${projectId}/description`);
    cy.wait(10000);
    cy.get('#e2e-text-box').click();
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Another edited text.', { force: true });

    cy.get('#e2e-mobile-preview-toggle').find('input').click({ force: true });

    getIframeBody()
      .contains('Edited text.Another edited text.')
      .should('be.visible');
  });
});
