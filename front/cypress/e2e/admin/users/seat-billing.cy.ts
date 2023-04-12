import { randomString, randomEmail } from '../../../support/commands';

describe('Seat based billing', () => {
  // User 1
  const user1FirstName = randomString();
  const user1LastName = randomString();
  const user1Email = randomEmail();
  const user1Password = randomString();
  let user1Id: string;

  // User 2
  const user2FirstName = randomString();
  const user2LastName = randomString();
  const user2Email = randomEmail();
  const user2Password = randomString();
  let user2Id: string;

  // User 3
  const user3FirstName = randomString();
  const user3LastName = randomString();
  const user3Email = randomEmail();
  const user3Password = randomString();
  let user3Id: string;

  // User 4
  const user4FirstName = randomString();
  const user4LastName = randomString();
  const user4Email = randomEmail();
  const user4Password = randomString();
  let user4Id: string;

  const createUsers = () => {
    cy.apiSignup(user1FirstName, user1LastName, user1Email, user1Password).then(
      (response) => {
        user1Id = response.body.data.id;
      }
    );

    cy.apiSignup(user2FirstName, user2LastName, user2Email, user2Password).then(
      (response) => {
        user2Id = response.body.data.id;
      }
    );

    cy.apiSignup(user3FirstName, user3LastName, user3Email, user3Password).then(
      (response) => {
        user2Id = response.body.data.id;
      }
    );

    cy.apiSignup(user4FirstName, user4LastName, user4Email, user4Password).then(
      (response) => {
        user2Id = response.body.data.id;
      }
    );
  };

  const cleanUp = () => {
    [user1Id, user2Id, user3Id, user4Id].filter(Boolean).forEach((userId) => {
      cy.apiRemoveUser(userId);
    });
  };

  beforeEach(() => {
    createUsers();
    cleanUp();

    cy.setAdminLoginCookie();
  });

  afterEach(() => {
    cleanUp();
  });

  it('shows and updates the admins correctly', () => {
    cy.visit('/admin/users/admins-managers');
    cy.acceptCookies();
    cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains('3');
    cy.get('#e2e-admin-remaining-seats').contains('1');
    cy.get('#e2e-admin-used-seats').contains('3');
    cy.get('#e2e-admin-total-seats').contains('4');

    // Navigate to users page
    cy.visit('/admin/users');

    // Set user as admin
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .contains('Registered user');
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .find('.e2e-more-actions')
      .click()
      .parent()
      .contains('Set as admin')
      .click();

    // Verify that user is set to admin
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .contains('Platform admin');
    cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains('4');

    // Verify that seat info is updated
    cy.visit('/admin/users/admins-managers');
    cy.get('#e2e-admin-remaining-seats').contains('0');
    cy.get('#e2e-admin-used-seats').contains('4');
    cy.get('#e2e-admin-total-seats').contains('4');

    // Navigate to users page
    cy.visit('/admin/users');
    // Set user as normal user
    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .find('.e2e-more-actions')
      .click()
      .parent()
      .contains('Set as normal user')
      .click();

    cy.get('[data-cy="e2e-confirm-change-seat-body"]').should('exist');
    // Confirm setting user to normal user
    cy.get('#e2e-confirm-change-seat-button').click();

    cy.get('.e2e-user-table')
      .find('.e2e-user-table-row')
      .first()
      .contains('Registered user');
    cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains('3');

    // Verify that seat info is updated
    cy.visit('/admin/users/admins-managers');
    cy.get('#e2e-admin-remaining-seats').contains('1');
    cy.get('#e2e-admin-used-seats').contains('3');
    cy.get('#e2e-admin-total-seats').contains('4');
  });
});
