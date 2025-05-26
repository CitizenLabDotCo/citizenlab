import { randomString, randomEmail } from '../support/commands';

describe('Idea posting permissions', () => {
  const unverifiedFirstName = randomString();
  const unverifiedLastName = randomString();
  const unverifiedEmail = randomEmail();
  const unverifiedPassword = randomString();
  let unverifiedId: string;

  const verifiedFirstName = randomString();
  const verifiedLastName = randomString();
  const verifiedEmail = randomEmail();
  const verifiedPassword = randomString();
  let verifiedId: string;

  before(() => {
    // create verified user
    cy.apiSignup(
      verifiedFirstName,
      verifiedLastName,
      verifiedEmail,
      verifiedPassword
    )
      .then((response) => {
        verifiedId = response.body.data.id;
        // create unverified user
        return cy.apiSignup(
          unverifiedFirstName,
          unverifiedLastName,
          unverifiedEmail,
          unverifiedPassword
        );
      })
      .then((response) => {
        unverifiedId = response.body.data.id;
        return cy.apiLogin(verifiedEmail, verifiedPassword);
      })
      .then((response) => {
        cy.apiVerifyBogus(response.body.jwt);
      });
  });

  describe('a project that requires verification', () => {
    it('sends unverified users to the signup flow', () => {
      cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
      cy.visit('/projects/verified-ideation');
      cy.acceptCookies();
      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.wait(500);
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });
      cy.get('#e2e-verification-wizard-root').should('exist');
    });

    it('lets verified users post', () => {
      cy.setLoginCookie(verifiedEmail, verifiedPassword);
      cy.visit('/projects/verified-ideation');
      cy.acceptCookies();
      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.wait(500);
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });
      cy.get('#e2e-idea-new-page').should('exist');
    });
  });

  after(() => {
    cy.apiRemoveUser(verifiedId);
    cy.apiRemoveUser(unverifiedId);
  });
});

describe('idea posting restricted to a group', () => {
  const emailDomain = '@ideaposting-permission-test.com';
  let projectId = '';
  let projectSlug = '';
  let groupId = '';
  let permittedUserId = '';
  let permittedUserEmail = `${randomString(5)}${emailDomain}`;
  let permittedUserPassword = randomString(8);
  let nonPermittedUserId = '';
  let nonPermittedUserEmail = randomEmail();
  let nonPermittedUserPassword = randomString(8);

  // Create project with smart group access posting rights
  before(() => {
    // Create project with ideation phase using our new utility function
    cy.createProjectWithIdeationPhase({
      phaseTitle: 'Ideation phase',
    }).then((result) => {
      projectId = result.projectId;
      projectSlug = result.projectSlug;
      const phaseId = result.phaseId;

      cy.apiCreateManualGroup({
        title: {
          en: 'Idea posting permission test',
        },
      }).then((response) => {
        groupId = response.body.data.id;
        // Use our new apiAddProjectGroup function to connect the group to the project
        cy.apiAddProjectGroup({
          groupId,
          projectId,
        });
      });

      cy.apiSetPhasePermission({
        phaseId,
        action: 'posting_idea',
        permissionBody: {
          permission: {
            permitted_by: 'users',
            group_ids: [groupId],
          },
        },
      });
    });

    // Create two accounts to test with
    cy.apiSignup(
      randomString(),
      randomString(),
      permittedUserEmail,
      permittedUserPassword
    ).then((response) => {
      permittedUserId = response.body.data.id;
      // Add the user to the allowed group
      cy.apiAddMembership({
        userId: permittedUserId,
        groupId,
      });
    });
    cy.apiSignup(
      randomString(),
      randomString(),
      nonPermittedUserEmail,
      nonPermittedUserPassword
    ).then((response) => {
      nonPermittedUserId = response.body.data.id;
    });
  });

  it("doesn't redirect users after authentication to form page if they are not permitted", () => {
    cy.visit(`projects/${projectSlug}`);
    cy.dataCy('e2e-ideation-start-idea-button').should('be.visible').click();
    cy.get('#email').type(nonPermittedUserEmail);
    cy.get('#password').type(nonPermittedUserPassword);
    cy.get('#e2e-signin-password-submit-button').click();
    cy.url().should('not.include', `/ideas/new`);
  });

  it('redirects users after authentication to form page if they are permitted', () => {
    cy.visit(`projects/${projectSlug}`);
    cy.dataCy('e2e-ideation-start-idea-button').should('be.visible').click();
    cy.get('#email').type(permittedUserEmail);
    cy.get('#password').type(permittedUserPassword);
    cy.get('#e2e-signin-password-submit-button').click();
    cy.url().should('include', `/ideas/new`);
  });

  it('shows prompt for authentication on form page if logged out user visits and shows form when authenticated', () => {
    cy.visit(`projects/${projectSlug}/ideas/new`);
    cy.get('#e2e-not-authorized').should('be.visible');
    cy.dataCy('e2e-unauthorized-must-sign-in').should('be.visible');
    cy.dataCy('e2e-trigger-authentication').click();
    cy.get('#email').type(permittedUserEmail);
    cy.get('#password').type(permittedUserPassword);
    cy.get('#e2e-signin-password-submit-button').click();
    cy.get('#idea-form').should('be.visible');
  });

  it('shows prompt for authentication on form page if logged out user visits and does not show form when not permitted', () => {
    cy.visit(`projects/${projectSlug}/ideas/new`);
    cy.get('#e2e-not-authorized').should('be.visible');
    cy.dataCy('e2e-unauthorized-must-sign-in').should('be.visible');
    cy.dataCy('e2e-trigger-authentication').click();
    cy.get('#email').type(nonPermittedUserEmail);
    cy.get('#password').type(nonPermittedUserPassword);
    cy.get('#e2e-signin-password-submit-button').click();
    cy.get('#idea-form').should('not.exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(permittedUserId);
    cy.apiRemoveUser(nonPermittedUserId);
  });

  // Click "new idea" button and sign up with user who is not part of the smart group
  // Confirm that the user was not redirect to the form and the button has a tooltip
});

describe('idea posting permissions for non-active users', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const randomFieldName = randomString();
  let userId: string;
  let customFieldId: string;

  before(() => {
    // create user
    cy.apiCreateCustomField(randomFieldName, true, false).then((response) => {
      customFieldId = response.body.data.id;
      cy.apiSignup(firstName, lastName, email, password).then((response) => {
        userId = response.body.data.id;
      });
      cy.setLoginCookie(email, password);
    });
  });

  it("doesn't let non-active users comment", () => {
    cy.setLoginCookie(email, password);
    cy.visit('projects/verified-ideation');
    cy.acceptCookies();
    cy.get('#e2e-ideas-list').find('.e2e-idea-card').should('exist');
    cy.get('#e2e-ideas-list').find('.e2e-idea-card').first().click();
    cy.get('#e2e-verify-identity-to-comment').should('exist');
    cy.get('#e2e-verify-identity-to-comment').click();
    cy.get('#e2e-authentication-modal').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveCustomField(customFieldId);
  });
});
