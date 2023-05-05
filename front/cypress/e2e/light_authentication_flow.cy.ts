import { randomString, randomEmail } from '../support/commands';

describe('Light authentication flow', () => {
  let projectId = '';
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((project) => {
      projectId = project.body.data.id;

      cy.intercept(`**/projects/${projectId}/permissions/posting_idea`).as(
        'setPermissionRequest'
      );

      cy.setAdminLoginCookie();
      cy.visit(`/admin/projects/${projectId}/permissions`);
      cy.get('#e2e-permission-email-confirmed-users').click();
      cy.wait('@setPermissionRequest').then(() => {
        cy.logout();
      });
    });
  });

  it('works when signing up with new email', () => {
    cy.visit(`/projects/${projectTitle}`);
    cy.wait(2000).then(() => {
      cy.get('#e2e-idea-button').click();
    });

    cy.get('input#email').focus().type(randomEmail());
    cy.get('#e2e-light-flow-email-submit').click();

    cy.get('#e2e-terms-conditions-container .e2e-checkbox').click();
    cy.get('#e2e-privacy-policy-container .e2e-checkbox').click();
    cy.get('#e2e-policies-continue').click();

    cy.get('input#code').focus().type('1234');
    cy.get('#e2e-verify-email-button').click();

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/ideas/new`
    );
    cy.logout();
  });

  it('works when signing up with existing normal user', () => {
    cy.visit(`/projects/${projectTitle}`);
    cy.wait(2000).then(() => {
      cy.get('#e2e-idea-button').click();
    });

    cy.get('input#email').focus().type('admin@citizenlab.co');
    cy.get('#e2e-light-flow-email-submit').click();

    cy.get('input#password').type('democracy2.0');
    cy.get('#e2e-light-flow-password-submit').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/ideas/new`
    );
    cy.logout();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
