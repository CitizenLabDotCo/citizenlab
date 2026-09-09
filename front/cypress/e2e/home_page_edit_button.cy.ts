import { randomEmail, randomString } from '../support/commands';

describe('Home page edit button', () => {
  it(' does not show edit homepage button when not logged in', () => {
    cy.visit('/');
    cy.get('#e2e-edit-homepage-button').should('not.exist');
  });

  it(' does not show edit homepage button when logged in as normal user', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    cy.apiSignup(firstName, lastName, email, password);
    cy.setLoginCookie(email, password);
    cy.visit('/');
    cy.get('#e2e-edit-homepage-button').should('not.exist');
  });

  describe('when logged in as project moderator', () => {
    const email = randomEmail();
    const password = randomString();
    let projectId: string;
    let moderatorId: string;

    before(() => {
      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        publicationStatus: 'published',
      }).then((project) => {
        projectId = project.body.data.id;

        cy.apiCreateModeratorForProject({
          firstName: randomString(),
          lastName: randomString(),
          email,
          password,
          projectId,
        }).then((moderator) => {
          moderatorId = moderator.body.data.id;
        });
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
      cy.apiRemoveUser(moderatorId);
    });

    it(' does not show edit homepage button', () => {
      cy.setLoginCookie(email, password);
      cy.visit('/');
      cy.get('#e2e-edit-homepage-button').should('not.exist');
    });
  });

  it(' shows edit homepage button when logged in as admin', () => {
    cy.setAdminLoginCookie();
    cy.visit('/');
    cy.get('#e2e-edit-homepage-button').should('exist');
  });
});
