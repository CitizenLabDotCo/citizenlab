import { randomString, randomEmail } from '../../../support/commands';
import { generateProjectFolder } from '../../../fixtures';

describe('Seat based billing', () => {
  const createdUserIds: string[] = [];
  let adminAndmoderatorsCount: number;

  type CreateUserType = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  };

  const createUsers = (users: CreateUserType[]) => {
    users.forEach((user) => {
      cy.apiSignup(
        user.first_name,
        user.last_name,
        user.email,
        user.password
      ).then((response) => {
        createdUserIds.push(response.body.data.id);
      });
    });
  };

  const cleanUp = () => {
    createdUserIds.forEach((id) => {
      cy.apiRemoveUser(id);
    });
  };

  after(() => {
    cleanUp();
  });

  describe('Admin seats', () => {
    // User 1
    const user1FirstName = randomString();
    const user1LastName = randomString();
    const user1Email = randomEmail();
    const user1Password = randomString();

    before(() => {
      createUsers([
        {
          first_name: user1FirstName,
          last_name: user1LastName,
          email: user1Email,
          password: user1Password,
        },
      ]);

      cy.apiGetUsersCount().then((response) => {
        adminAndmoderatorsCount =
          response.body.administrators_count + response.body.managers_count;
      });

      cy.setAdminLoginCookie();
    });

    it('is able to set a user to admin or normal user and shows confirmation when exceeding seats', () => {
      cy.apiGetAppConfiguration().then((appConfigurationResponse) => {
        let additionalAdmins =
          appConfigurationResponse.body?.data.attributes.settings.core
            .additional_admins_number;
        let maximumAdmins =
          appConfigurationResponse.body?.data.attributes.settings.core
            .maximum_admins_number;

        cy.apiGetSeats().then((seatsResponse) => {
          let usedSeats = seatsResponse.body.data.attributes.admins_number;
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

  const testShowModalOnAddingModerator = () => {
    cy.apiGetAppConfiguration().then((appConfigurationResponse) => {
      const additionalModerators =
        appConfigurationResponse.body.data.attributes.settings.core
          .additional_moderators_number;
      const maximumModerators =
        appConfigurationResponse.body.data.attributes.settings.core
          .maximum_moderators_number;

      cy.apiGetSeats().then((seatsResponse) => {
        const usedSeats =
          seatsResponse.body.data.attributes.project_moderators_number;
        const totalSeats = additionalModerators + maximumModerators;

        if (usedSeats >= totalSeats) {
          // Verify that user is required to confirm
          cy.get('[data-cy="e2e-add-moderators-body"]').should('exist');
          // Confirm setting user to moderator user
          cy.get('#e2e-add-moderator-button').click();

          // Check that success is shown and close the modal
          cy.get('#e2e-seat-set-success-body').should('exist');
          cy.get('#e2e-close-seat-success-button').click();
        }
      });
    });
  };

  describe('Project moderator', () => {
    const projectTitle = randomString();
    const projectDescription = randomString();
    const projectDescriptionPreview = randomString(30);
    let projectId: string;

    // User 2
    const user2FirstName = randomString();
    const user2LastName = randomString();
    const user2Email = randomEmail();
    const user2Password = randomString();

    // User 3
    const user3FirstName = randomString();
    const user3LastName = randomString();
    const user3Email = randomEmail();
    const user3Password = randomString();

    // User 4
    const user4FirstName = randomString();
    const user4LastName = randomString();
    const user4Email = randomEmail();
    const user4Password = randomString();

    // User 5
    const user5FirstName = randomString();
    const user5LastName = randomString();
    const user5Email = randomEmail();
    const user5Password = randomString();

    // User 6
    const user6FirstName = randomString();
    const user6LastName = randomString();
    const user6Email = randomEmail();
    const user6Password = randomString();

    // User 7
    const user7FirstName = randomString();
    const user7LastName = randomString();
    const user7Email = randomEmail();
    const user7Password = randomString();

    before(() => {
      cy.apiCreateProject({
        type: 'continuous',
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        participationMethod: 'native_survey',
      }).then((project) => {
        projectId = project.body.data.id;
      });
      createUsers([
        {
          first_name: user2FirstName,
          last_name: user2LastName,
          email: user2Email,
          password: user2Password,
        },
        {
          first_name: user3FirstName,
          last_name: user3LastName,
          email: user3Email,
          password: user3Password,
        },
        {
          first_name: user4FirstName,
          last_name: user4LastName,
          email: user4Email,
          password: user4Password,
        },
        {
          first_name: user5FirstName,
          last_name: user5LastName,
          email: user5Email,
          password: user5Password,
        },
        {
          first_name: user6FirstName,
          last_name: user6LastName,
          email: user6Email,
          password: user6Password,
        },
        {
          first_name: user7FirstName,
          last_name: user7LastName,
          email: user7Email,
          password: user7Password,
        },
      ]);
    });

    beforeEach(() => {
      cy.setAdminLoginCookie();
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    it('is able to add a moderator and shows confirmation when needed', () => {
      cy.visit(`admin/projects/${projectId}/permissions`);
      cy.acceptCookies();

      cy.intercept(`**/projects/${projectId}/moderators`).as(
        'moderatorsRequest'
      );
      cy.wait('@moderatorsRequest');

      // Add moderator and check that they are shown in the list
      cy.get('#projectModeratorUserSearch').should('exist');
      cy.get('#projectModeratorUserSearch').type(`${user2Email}`);
      cy.get(`[data-cy="e2e-user-${user2Email}"]`).click();
      cy.get('[data-cy="e2e-add-moderators-button"]').click();
      testShowModalOnAddingModerator();
      cy.get('.e2e-admin-list').contains(user2Email);

      // Add moderator and check that they are shown in the list
      cy.get('#projectModeratorUserSearch').should('exist');
      cy.get('#projectModeratorUserSearch').type(`${user3Email}`);
      cy.get(`[data-cy="e2e-user-${user3Email}"]`).click();
      cy.get('[data-cy="e2e-add-moderators-button"]').click();
      testShowModalOnAddingModerator();
      cy.get('.e2e-admin-list').contains(user3Email);

      // Add moderator and check that they are shown in the list
      cy.get('#projectModeratorUserSearch').should('exist');
      cy.get('#projectModeratorUserSearch').type(`${user4Email}`);
      cy.get(`[data-cy="e2e-user-${user4Email}"]`).click();
      cy.get('[data-cy="e2e-add-moderators-button"]').click();
      testShowModalOnAddingModerator();
      cy.get('.e2e-admin-list').contains(user4Email);

      // Add moderator and check that they are shown in the list
      cy.get('#projectModeratorUserSearch').should('exist');
      cy.get('#projectModeratorUserSearch').type(`${user5Email}`);
      cy.get(`[data-cy="e2e-user-${user5Email}"]`).click();
      cy.get('[data-cy="e2e-add-moderators-button"]').click();
      testShowModalOnAddingModerator();
      cy.get('.e2e-admin-list').contains(user5Email);
    });

    it('updates admin and moderators number', () => {
      cy.visit('/admin/users/admins-managers');
      cy.acceptCookies();

      cy.apiGetUsersCount().then((response) => {
        adminAndmoderatorsCount =
          response.body.administrators_count + response.body.managers_count;

        cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains(
          `${adminAndmoderatorsCount}`
        );

        // Navigate to the project permissions page
        cy.visit(`admin/projects/${projectId}/permissions`);
        cy.intercept(`**/projects/${projectId}/moderators`).as(
          'moderatorsRequest'
        );
        cy.wait('@moderatorsRequest');

        // Add moderator and check that they are shown in the list
        cy.get('#projectModeratorUserSearch').should('exist');
        cy.get('#projectModeratorUserSearch').type(`${user6Email}`);
        cy.get(`[data-cy="e2e-user-${user6Email}"]`).click();
        cy.get('[data-cy="e2e-add-moderators-button"]').click();
        testShowModalOnAddingModerator();
        cy.get('.e2e-admin-list').contains(user6Email);

        cy.visit('/admin/users/admins-managers');
        cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains(
          `${adminAndmoderatorsCount + 1}`
        );
      });
    });

    it('updates remaining seats and used seats', () => {
      cy.visit('/admin/users/admins-managers');
      cy.acceptCookies();

      cy.apiGetAppConfiguration().then((appConfigurationResponse) => {
        let additionalModerators =
          appConfigurationResponse.body.data.attributes.settings.core
            .additional_moderators_number;
        let maximumModerators =
          appConfigurationResponse.body.data.attributes.settings.core
            .maximum_moderators_number;

        cy.apiGetSeats().then((seatsResponse) => {
          let usedSeats =
            seatsResponse.body.data.attributes.project_moderators_number;
          let totalSeats = additionalModerators + maximumModerators;
          let remainingSeats = totalSeats - usedSeats;

          cy.get('#e2e-moderator-remaining-seats').contains(
            `${remainingSeats}`
          );
          cy.get('#e2e-moderator-used-seats').contains(`${usedSeats}`);
          cy.get('#e2e-moderator-total-seats').contains(`${totalSeats}`);

          // Navigate to the project permissions page
          cy.visit(`admin/projects/${projectId}/permissions`);

          // Add moderator and check that they are shown in the list
          cy.get('#projectModeratorUserSearch').should('exist');
          cy.get('#projectModeratorUserSearch').type(`${user7Email}`);
          cy.get(`[data-cy="e2e-user-${user7Email}"]`).click();
          cy.get('[data-cy="e2e-add-moderators-button"]').click();
          testShowModalOnAddingModerator();
          cy.get('.e2e-admin-list').contains(user7Email);

          cy.visit('/admin/users/admins-managers');

          // We make a fresh request to the backend to get the updated values since the additionalModerators can change
          cy.apiGetAppConfiguration().then((newAppConfigurationResponse) => {
            usedSeats = usedSeats + 1;
            additionalModerators =
              newAppConfigurationResponse.body.data.attributes.settings.core
                .additional_moderators_number;
            maximumModerators =
              newAppConfigurationResponse.body.data.attributes.settings.core
                .maximum_moderators_number;
            totalSeats = additionalModerators + maximumModerators;
            remainingSeats = totalSeats - usedSeats;

            // Verify that the numbers have been updated
            cy.get('#e2e-moderator-remaining-seats').contains(
              `${remainingSeats}`
            );
            cy.get('#e2e-moderator-used-seats').contains(`${usedSeats}`);
            cy.get('#e2e-moderator-total-seats').contains(`${totalSeats}`);
          });
        });
      });
    });
  });

  describe('Folder moderator', () => {
    let folderId: string;

    // User 8
    const user8FirstName = randomString();
    const user8LastName = randomString();
    const user8Email = randomEmail();
    const user8Password = randomString();

    // User 9
    const user9FirstName = randomString();
    const user9LastName = randomString();
    const user9Email = randomEmail();
    const user9Password = randomString();

    // User 10
    const user10FirstName = randomString();
    const user10LastName = randomString();
    const user10Email = randomEmail();
    const user10Password = randomString();

    // User 11
    const user11FirstName = randomString();
    const user11LastName = randomString();
    const user11Email = randomEmail();
    const user11Password = randomString();

    // User 12
    const user12FirstName = randomString();
    const user12LastName = randomString();
    const user12Email = randomEmail();
    const user12Password = randomString();

    // User 13
    const user13FirstName = randomString();
    const user13LastName = randomString();
    const user13Email = randomEmail();
    const user13Password = randomString();

    before(() => {
      cy.apiCreateFolder(generateProjectFolder({})).then((folder) => {
        folderId = folder.body.data.id;
      });

      createUsers([
        {
          first_name: user8FirstName,
          last_name: user8LastName,
          email: user8Email,
          password: user8Password,
        },
        {
          first_name: user9FirstName,
          last_name: user9LastName,
          email: user9Email,
          password: user9Password,
        },
        {
          first_name: user10FirstName,
          last_name: user10LastName,
          email: user10Email,
          password: user10Password,
        },
        {
          first_name: user11FirstName,
          last_name: user11LastName,
          email: user11Email,
          password: user11Password,
        },
        {
          first_name: user12FirstName,
          last_name: user12LastName,
          email: user12Email,
          password: user12Password,
        },
        {
          first_name: user13FirstName,
          last_name: user13LastName,
          email: user13Email,
          password: user13Password,
        },
      ]);
    });

    beforeEach(() => {
      cy.setAdminLoginCookie();
    });

    after(() => {
      cy.apiRemoveFolder(folderId);
    });

    it('is able to add a moderator and shows confirmation when needed', () => {
      cy.visit(`admin/projects/folders/${folderId}/permissions`);
      cy.acceptCookies();

      // Add moderator and check that they are shown in the list
      cy.get('#folderModeratorUserSearch').should('exist');
      cy.get('#folderModeratorUserSearch').type(`${user8Email}`);
      cy.get(`[data-cy="e2e-user-${user8Email}"]`).click();
      cy.get('[data-cy="e2e-add-folder-moderator-button"]').click();
      testShowModalOnAddingModerator();
      cy.get('.e2e-admin-list').contains(user8Email);

      // Add moderator and check that they are shown in the list
      cy.get('#folderModeratorUserSearch').should('exist');
      cy.get('#folderModeratorUserSearch').type(`${user9Email}`);
      cy.get(`[data-cy="e2e-user-${user9Email}"]`).click();
      cy.get('[data-cy="e2e-add-folder-moderator-button"]').click();
      testShowModalOnAddingModerator();
      cy.get('.e2e-admin-list').contains(user9Email);

      // Add moderator and check that they are shown in the list
      cy.get('#folderModeratorUserSearch').should('exist');
      cy.get('#folderModeratorUserSearch').type(`${user10Email}`);
      cy.get(`[data-cy="e2e-user-${user10Email}"]`).click();
      cy.get('[data-cy="e2e-add-folder-moderator-button"]').click();
      testShowModalOnAddingModerator();
      cy.get('.e2e-admin-list').contains(user10Email);

      // Add moderator and check that they are shown in the list
      cy.get('#folderModeratorUserSearch').should('exist');
      cy.get('#folderModeratorUserSearch').type(`${user11Email}`);
      cy.get(`[data-cy="e2e-user-${user11Email}"]`).click();
      cy.get('[data-cy="e2e-add-folder-moderator-button"]').click();
      testShowModalOnAddingModerator();
      cy.get('.e2e-admin-list').contains(user11Email);
    });

    it('updates admin and moderators number', () => {
      cy.visit('/admin/users/admins-managers');
      cy.acceptCookies();

      cy.apiGetUsersCount().then((response) => {
        adminAndmoderatorsCount =
          response.body.administrators_count + response.body.managers_count;

        cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains(
          `${adminAndmoderatorsCount}`
        );

        // Navigate to the folder permissions page
        cy.visit(`admin/projects/folders/${folderId}/permissions`);

        // Add moderator and check that they are shown in the list
        cy.get('#folderModeratorUserSearch').should('exist');
        cy.get('#folderModeratorUserSearch').type(`${user12Email}`);
        cy.get(`[data-cy="e2e-user-${user12Email}"]`).click();
        cy.get('[data-cy="e2e-add-folder-moderator-button"]').click();
        testShowModalOnAddingModerator();
        cy.get('.e2e-admin-list').contains(user12Email);

        cy.visit('/admin/users/admins-managers');
        cy.get('[data-cy="e2e-admin-and-moderator-count"]').contains(
          `${adminAndmoderatorsCount + 1}`
        );
      });
    });
  });
});
