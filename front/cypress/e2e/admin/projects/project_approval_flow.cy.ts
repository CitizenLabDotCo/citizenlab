import { randomString, randomEmail } from '../../../support/commands';

const email = randomEmail();
const password = randomString();
const projectTitle = randomString();
const projectDescription = randomString(30);
const projectDescriptionPreview = randomString(30);
let projectId: string;
let userId: string;

describe('Admin project approval flow', () => {
  before(() => {
    if (projectId && userId) {
      cy.apiRemoveProject(projectId);
    }

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.apiCreateModeratorForProject({
        firstName: 'John',
        lastName: 'Doe',
        email,
        password,
        projectId,
      }).then((moderator) => {
        userId = moderator.body.data.id;
      });
    });
  });

  after(() => {
    if (projectId && userId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('should be possible for a project moderator to request approval for a project', () => {
    cy.setLoginCookie(email, password);

    cy.intercept('GET', `**/projects/${projectId}/review`).as('getReview');
    cy.intercept('GET', `**/projects/${projectId}/phases`).as('getPhases');

    cy.visit(`admin/projects/${projectId}`);

    cy.location('pathname').should(
      'include',
      `/admin/projects/${projectId}/phases/setup`
    );
    cy.wait(['@getReview', '@getPhases']);

    cy.dataCy('e2e-request-approval')
      .should('be.visible')
      .and('not.have.class', 'processing')
      .click();

    cy.get('#e2e-request-approval-confirm').click(); // prob
    cy.dataCy('e2e-request-approval').should('not.exist');
    cy.dataCy('e2e-request-approval-pending').should('exist');
    cy.get('#e2e-publish').should('not.exist');
  });

  it('should be possible for an admin to approve a project', () => {
    cy.setLoginCookie('admin@govocal.com', 'democracy2.0');
    cy.visit(`admin/projects/${projectId}`);
    cy.get('#e2e-approve-project').click();
    cy.get('#e2e-approve-project').should('not.exist');
    cy.get('#e2e-publish').should('exist');
  });

  it('should be possible for a project moderator to publish an approved project', () => {
    cy.setLoginCookie(email, password);
    cy.visit(`admin/projects/${projectId}`);

    cy.get('#e2e-publish').click();
    cy.get('#e2e-publish').should('not.exist');

    // Once the project is published, the publication status dropdown should be visible
    cy.get('#e2e-admin-edit-publication-status').should('exist');
  });
});
