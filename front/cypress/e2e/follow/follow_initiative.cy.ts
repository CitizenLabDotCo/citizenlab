import { randomString, randomEmail } from '../../support/commands';

describe('Follow Initiative', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const initiativeTitle1 = randomString(40);
  const initiativeContent1 = randomString(60);
  const initiativeTitle2 = randomString(40);
  const initiativeContent2 = randomString(60);
  const projectTitle = randomString();
  let userId: string;
  let initiativeId1: string;
  let initiativeSlug1: string;
  let initiativeId2: string;
  let initiativeSlug2: string;
  let userSlug: string;

  before(() => {
    cy.apiCreateInitiative({
      initiativeTitle: initiativeTitle1,
      initiativeContent: initiativeContent1,
    }).then((initiaitve) => {
      initiativeId1 = initiaitve.body.data.id;
      initiativeSlug1 = initiaitve.body.data.attributes.slug;
    });

    cy.apiCreateInitiative({
      initiativeTitle: initiativeTitle2,
      initiativeContent: initiativeContent2,
    }).then((initiaitve) => {
      initiativeId2 = initiaitve.body.data.id;
      initiativeSlug2 = initiaitve.body.data.attributes.slug;
    });

    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
      userSlug = response.body.data.attributes.slug;
    });
  });

  after(() => {
    if (userId) {
      cy.apiRemoveUser(userId);
    }
    if (initiativeId1) {
      cy.apiRemoveInitiative(initiativeId1);
    }
    if (initiativeId2) {
      cy.apiRemoveInitiative(initiativeId2);
    }
  });

  it('automatically follows a user after creating an initiative and allows user to unfollow it', () => {
    cy.setAdminLoginCookie();

    cy.visit(`/initiatives/${initiativeSlug1}`);
    cy.acceptCookies();
    cy.get('#e2e-initiative-title').contains(initiativeTitle1);

    // Shows an unfollow button because the user follows the initiative automatically since they created it
    cy.get('[data-cy="e2e-unfollow-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-button"]').should('not.exist');

    // unfollow
    cy.get('[data-cy="e2e-unfollow-button"]').click();

    cy.get('[data-cy="e2e-unfollow-button"]').should('not.exist');
    cy.get('[data-cy="e2e-follow-button"]').should('exist');
  });

  it('shows a follow option to a new user and shows the initiative in the activity following page after following where it can be unfollowed', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/initiatives/${initiativeSlug2}`);
    cy.acceptCookies();
    cy.get('#e2e-initiative-title').contains(initiativeTitle2);

    // Follow
    cy.get('[data-cy="e2e-follow-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-button"]').click();

    // Check that it shows unfollow after
    cy.get('[data-cy="e2e-unfollow-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-button"]').should('not.exist');

    cy.visit(`/profile/${userSlug}/following`);
    cy.get('#tab-Initiative').click();

    cy.get('.e2e-card-title').contains(initiativeTitle2);

    cy.get('[data-cy="e2e-unfollow-button"]').should('exist');
    cy.get('[data-cy="e2e-unfollow-button"]').click();

    cy.get('.e2e-card-title').should('not.exist');
  });
});
