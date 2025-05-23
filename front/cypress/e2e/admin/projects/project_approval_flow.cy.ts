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
    cy.apiRemoveProject(projectId);
  });

  it('should be possible for a project moderator to request approval for a project', () => {
    cy.setLoginCookie(email, password);
    cy.visit(`admin/projects/${projectId}`);
    cy.dataCy('e2e-request-approval').click();
    cy.get('#e2e-request-approval-confirm').click();
    cy.dataCy('e2e-request-approval').should('not.exist');
    cy.dataCy('e2e-request-approval-pending').should('exist');
    cy.get('#e2e-publish').should('not.exist');
  });

  it('should be possible for an admin to approve a project', () => {
    cy.setAdminLoginCookie();
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
