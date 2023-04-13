import { randomString, randomEmail } from '../../../support/commands';

describe('Seat based billing', () => {
  // User 1
  const user1FirstName = randomString();
  const user1LastName = randomString();
  const user1Password = randomString();
  let user1Id: string;

  // User 2
  const user2FirstName = randomString();
  const user2LastName = randomString();
  const user2Password = randomString();
  let user2Id: string;

  // User 3
  const user3FirstName = randomString();
  const user3LastName = randomString();
  const user3Password = randomString();
  let user3Id: string;

  // User 4
  const user4FirstName = randomString();
  const user4LastName = randomString();
  const user4Password = randomString();
  let user4Id: string;
  let adminAndmoderatorsCount: number;

  const createUsers = () => {
    const user1Email = randomEmail();
    const user2Email = randomEmail();
    const user3Email = randomEmail();
    const user4Email = randomEmail();

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
    cleanUp();
    createUsers();

    cy.apiGetUsersCount().then((response) => {
      adminAndmoderatorsCount =
        response.body.administrators_count + response.body.managers_count;
    });

    cy.setAdminLoginCookie();
  });

  it('is able to set a user to admin or normal user and shows confirmation when exceeding seats', () => {
    cy.apiGetAppConfiguration().then((appConfigurationResponse) => {
      const additionalModerators =
        appConfigurationResponse.body.data.attributes.settings.core
          .additional_moderators_number;
      const maximumModerators =
        appConfigurationResponse.body.data.attributes.settings.core
          .maximum_moderators_number;
      let additionalAdmins =
        appConfigurationResponse.body?.data.attributes.settings.core
          .additional_admins_number;
      let maximumAdmins =
        appConfigurationResponse.body?.data.attributes.settings.core
          .maximum_admins_number;

      console.log('additionalModerators', additionalModerators);
      console.log('maximumModerators', maximumModerators);
      console.log('additionalAdmins', additionalAdmins);
      console.log('maximumAdmins', maximumAdmins);

      cy.apiGetSeats().then((seatsResponse) => {
        const currentModeratorSeats =
          seatsResponse.body.data.attributes.project_moderators_number;
        const currentAdminSeats =
          seatsResponse.body.data.attributes.admins_number;

        console.log('currentModeratorSeats', currentModeratorSeats);
        console.log('currentAdminSeats', currentAdminSeats);

        let usedSeats = currentAdminSeats;
        let totalSeats = additionalAdmins + maximumAdmins;
        let remainingSeats = totalSeats - usedSeats;

        cy.visit('/admin/users/admins-managers');
        cy.acceptCookies();
        cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains(
          `${adminAndmoderatorsCount}`
        );
        cy.get('#e2e-admin-remaining-seats').contains(`${remainingSeats}`);
        cy.get('#e2e-admin-used-seats').contains(`${usedSeats}`);
        cy.get('#e2e-admin-total-seats').contains(`${totalSeats}`);

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

        if (usedSeats >= totalSeats) {
          // Verify that user is required to confirm
          cy.get('[data-cy="e2e-confirm-change-seat-body"]').should('exist');
          // Confirm setting user to admin user
          cy.get('#e2e-confirm-change-seat-button').click();

          // Check that success is shown and close the modal
          cy.get('#e2e-seat-set-success-body').should('exist');
          cy.get('#e2e-close-seat-success-button').click();
        }

        // Verify that user is set to admin
        cy.get('.e2e-user-table')
          .find('.e2e-user-table-row')
          .first()
          .contains('Platform admin');
        cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains(
          `${adminAndmoderatorsCount + 1}`
        );

        cy.apiGetAppConfiguration().then((newAppConfigurationResponse) => {
          // Since we set the user as admin, we need to update the used seats
          usedSeats = usedSeats + 1;
          additionalAdmins =
            newAppConfigurationResponse.body?.data.attributes.settings.core
              .additional_admins_number;
          maximumAdmins =
            newAppConfigurationResponse.body?.data.attributes.settings.core
              .maximum_admins_number;

          // The additional admins could have been increased so we need to update the total seats and remaining seats
          totalSeats = additionalAdmins + maximumAdmins;
          remainingSeats = totalSeats - usedSeats;

          // Verify that seat info is updated
          cy.visit('/admin/users/admins-managers');
          cy.get('#e2e-admin-remaining-seats').contains(`${remainingSeats}`);
          cy.get('#e2e-admin-used-seats').contains(`${usedSeats}`);
          cy.get('#e2e-admin-total-seats').contains(`${totalSeats}`);

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
          cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains(
            `${adminAndmoderatorsCount}`
          );

          // No need to make an API call to get the seats since setting to normal user does not change the additional seats
          usedSeats = usedSeats - 1;
          remainingSeats = totalSeats - usedSeats;

          // Verify that seat info is updated
          cy.visit('/admin/users/admins-managers');
          cy.get('#e2e-admin-remaining-seats').contains(`${remainingSeats}`);
          cy.get('#e2e-admin-used-seats').contains(`${usedSeats}`);
          cy.get('#e2e-admin-total-seats').contains(`${totalSeats}`);
        });
      });
    });
  });
});
