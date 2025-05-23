import { randomString, randomEmail } from '../../../support/commands';
import { generateProjectFolder } from '../../../fixtures';
import moment = require('moment');

describe('Seat based billing', () => {
  let createdUserIds: string[] = [];
  let adminCount: number;
  let moderatorsCount: number;

  type CreateUserType = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };

  const createUsers = (createUserData: CreateUserType[]) => {
    createUserData.forEach((user) => {
      cy.apiSignup(
        user.firstName,
        user.lastName,
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
    createdUserIds = [];
  };

  describe('with admin seats', () => {
    // User 1
    const user1FirstName = randomString();
    const user1LastName = randomString();
    const user1Email = randomEmail();
    const user1Password = randomString();

    before(() => {
      createUsers([
        {
          firstName: user1FirstName,
          lastName: user1LastName,
          email: user1Email,
          password: user1Password,
        },
      ]);

      cy.apiGetUsersCount().then((response) => {
        adminCount = response.body.data.attributes.administrators_count;
        moderatorsCount = response.body.data.attributes.moderators_count;
      });

      cy.setAdminLoginCookie();
    });

    after(() => {
      cleanUp();
    });

    it('admin can change seat type and needs to confirm on seat excess', () => {
      // We get updated seat data from the API and use that to compare with the UI. This is to avoid using hardcoded values as those could be flaky depending on user data left by other tests in other files.
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

          cy.visit('/admin/users/admins');
          cy.acceptCookies();
          cy.dataCy('e2e-admin-count').contains(adminCount);
          cy.dataCy('e2e-admin-remaining-seats').contains(remainingSeats);
          cy.dataCy('e2e-admin-used-seats').contains(usedSeats);
          cy.dataCy('e2e-admin-total-seats').contains(totalSeats);

          // Navigate to users page
          cy.visit('/admin/users');

          cy.get('.e2e-user-table')
            .find('.e2e-user-table-row')
            .first()
            .as('firstRow');

          // Set user as admin
          cy.get('@firstRow').contains(user1Email);
          cy.get('@firstRow').contains('Registered user');
          cy.get('@firstRow').find('.e2e-more-actions').click();

          cy.get('.tippy-content').contains('Set as admin').click();

          if (usedSeats >= totalSeats) {
            // Verify that user is required to confirm
            cy.dataCy('e2e-confirm-change-seat-body').should('exist');
            // Confirm setting user to admin user
            cy.dataCy('e2e-confirm-change-seat-button').click();

            // Check that success is shown and close the modal
            cy.dataCy('e2e-seat-set-success-body').should('exist');
            cy.dataCy('e2e-close-seat-success-button').click();
          }

          // Verify that user is set to admin
          cy.get('@firstRow').contains(user1Email);
          cy.get('@firstRow').contains('Platform admin');
          cy.dataCy('e2e-admin-count').contains(`${adminCount + 1}`);

          // We get updated seat data from the API and use that to compare with the UI. This is to avoid using hardcoded values as those could be flaky depending on user data left by other tests in other files.
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
            cy.visit('/admin/users/admins');
            cy.dataCy('e2e-admin-remaining-seats').contains(remainingSeats);
            cy.dataCy('e2e-admin-used-seats').contains(usedSeats);
            cy.dataCy('e2e-admin-total-seats').contains(totalSeats);

            // Navigate to users page
            cy.visit('/admin/users');
            // Set user as normal user
            cy.get('@firstRow').find('.e2e-more-actions').click();

            cy.get('.tippy-content').contains('Set as normal user').click();

            cy.dataCy('e2e-confirm-change-seat-body').should('exist');
            // Confirm setting user to normal user
            cy.dataCy('e2e-confirm-change-seat-button').click();

            cy.get('@firstRow').contains(user1Email);
            cy.get('@firstRow').contains('Registered user');
            cy.dataCy('e2e-admin-count').contains(adminCount);

            // No need to make an API call to get the seats since setting to normal user does not change the additional seats
            usedSeats = usedSeats - 1;
            remainingSeats = totalSeats - usedSeats;

            // Verify that seat info is updated
            cy.visit('/admin/users/admins');
            cy.dataCy('e2e-admin-remaining-seats').contains(remainingSeats);
            cy.dataCy('e2e-admin-used-seats').contains(usedSeats);
            cy.dataCy('e2e-admin-total-seats').contains(totalSeats);
          });
        });
      });
    });
  });

  const testShowModalOnAddingModerator = (previousNoOfUsedSeats: number) => {
    // We get updated seat data from the API and use that to compare with the UI. This is to avoid using hardcoded values as those could be flaky depending on user data left by other tests in other files.
    cy.apiGetAppConfiguration().then((appConfigurationResponse) => {
      const additionalModerators =
        appConfigurationResponse.body.data.attributes.settings.core
          .additional_moderators_number;
      const maximumModerators =
        appConfigurationResponse.body.data.attributes.settings.core
          .maximum_moderators_number;

      cy.apiGetSeats().then((seatsResponse) => {
        const usedSeats = seatsResponse.body.data.attributes.moderators_number;
        const totalSeats = additionalModerators + maximumModerators;
        const hasSeatBeenAdded = previousNoOfUsedSeats !== usedSeats;

        if (usedSeats >= totalSeats && !hasSeatBeenAdded) {
          // Verify that user is required to confirm
          cy.dataCy('e2e-add-moderators-body').should('exist');
          // Confirm setting user to moderator user
          cy.dataCy('e2e-confirm-add-moderator').click();

          // Check that success is shown and close the modal
          cy.dataCy('e2e-seat-set-success-body').should('exist');
          cy.dataCy('e2e-close-seat-success-button').click();
        }
      });
    });
  };

  describe('with moderator seats (project moderator)', () => {
    const projectTitle = randomString();
    const projectDescription = randomString();
    const projectDescriptionPreview = randomString(30);
    let projectId: string;
    let phaseId: string;

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

    let noOfUsedModeratorSeats: number;

    before(() => {
      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
      })
        .then((project) => {
          projectId = project.body.data.id;
          return cy.apiCreatePhase({
            projectId,
            title: 'firstPhaseTitle',
            startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
            endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
            participationMethod: 'ideation',
            canPost: true,
            canComment: true,
            canReact: true,
          });
        })
        .then((phase) => {
          phaseId = phase.body.data.id;
        });
      createUsers([
        {
          firstName: user2FirstName,
          lastName: user2LastName,
          email: user2Email,
          password: user2Password,
        },
        {
          firstName: user3FirstName,
          lastName: user3LastName,
          email: user3Email,
          password: user3Password,
        },
        {
          firstName: user4FirstName,
          lastName: user4LastName,
          email: user4Email,
          password: user4Password,
        },
        {
          firstName: user5FirstName,
          lastName: user5LastName,
          email: user5Email,
          password: user5Password,
        },
        {
          firstName: user6FirstName,
          lastName: user6LastName,
          email: user6Email,
          password: user6Password,
        },
        {
          firstName: user7FirstName,
          lastName: user7LastName,
          email: user7Email,
          password: user7Password,
        },
      ]);
    });

    beforeEach(() => {
      cy.apiGetSeats().then((reposnse) => {
        noOfUsedModeratorSeats =
          reposnse.body.data.attributes.moderators_number;
      });
      cy.setAdminLoginCookie();
    });

    after(() => {
      cleanUp();
      cy.apiRemoveProject(projectId);
    });

    it('allows user to add a moderator and shows a confirmation when needed', () => {
      cy.visit(`admin/projects/${projectId}/settings/access-rights`);
      cy.acceptCookies();

      cy.intercept(`**/projects/${projectId}/moderators`).as(
        'moderatorsRequest'
      );
      cy.wait('@moderatorsRequest');

      // Add moderator and check that they are shown in the list
      cy.get('#projectModeratorUserSearch').should('exist');
      cy.get('#projectModeratorUserSearch').type(user2Email);
      cy.get(`[data-cy="e2e-user-${user2Email}"]`).click();
      cy.dataCy('e2e-add-project-moderator-button').click();
      testShowModalOnAddingModerator(noOfUsedModeratorSeats);
      cy.get('.e2e-admin-list').contains(user2Email);
      noOfUsedModeratorSeats = noOfUsedModeratorSeats + 1;

      // Add moderator and check that they are shown in the list
      cy.get('#projectModeratorUserSearch').should('exist');
      cy.get('#projectModeratorUserSearch').type(user3Email);
      cy.get(`[data-cy="e2e-user-${user3Email}"]`).click();
      cy.dataCy('e2e-add-project-moderator-button').click();
      testShowModalOnAddingModerator(noOfUsedModeratorSeats);
      cy.get('.e2e-admin-list').contains(user3Email);
      noOfUsedModeratorSeats = noOfUsedModeratorSeats + 1;

      // Add moderator and check that they are shown in the list
      cy.get('#projectModeratorUserSearch').should('exist');
      cy.get('#projectModeratorUserSearch').type(user4Email);
      cy.get(`[data-cy="e2e-user-${user4Email}"]`).click();
      cy.dataCy('e2e-add-project-moderator-button').click();
      testShowModalOnAddingModerator(noOfUsedModeratorSeats);
      cy.get('.e2e-admin-list').contains(user4Email);
      noOfUsedModeratorSeats = noOfUsedModeratorSeats + 1;

      // Add moderator and check that they are shown in the list
      cy.get('#projectModeratorUserSearch').should('exist');
      cy.get('#projectModeratorUserSearch').type(user5Email);
      cy.get(`[data-cy="e2e-user-${user5Email}"]`).click();
      cy.dataCy('e2e-add-project-moderator-button').click();
      testShowModalOnAddingModerator(noOfUsedModeratorSeats);
      cy.get('.e2e-admin-list').contains(user5Email);
    });

    it('updates admin and moderators number', () => {
      cy.visit('/admin/users/admins');
      cy.acceptCookies();

      cy.apiGetUsersCount().then((response) => {
        adminCount = response.body.data.attributes.administrators_count;
        moderatorsCount = response.body.data.attributes.moderators_count;

        cy.dataCy('e2e-admin-count').contains(adminCount);
        cy.dataCy('e2e-moderator-count').contains(moderatorsCount);

        // Navigate to the project permissions page
        cy.visit(`admin/projects/${projectId}/settings/access-rights`);
        cy.intercept(`**/projects/${projectId}/moderators`).as(
          'moderatorsRequest'
        );
        cy.wait('@moderatorsRequest');

        // Add moderator and check that they are shown in the list
        cy.get('#projectModeratorUserSearch').should('exist');
        cy.get('#projectModeratorUserSearch').type(user6Email);
        cy.get(`[data-cy="e2e-user-${user6Email}"]`).click();
        cy.dataCy('e2e-add-project-moderator-button').click();
        testShowModalOnAddingModerator(noOfUsedModeratorSeats);
        cy.get('.e2e-admin-list').contains(user6Email);

        cy.visit('/admin/users/admins');
        cy.dataCy('e2e-moderator-count').contains(
          `${response.body.data.attributes.moderators_count + 1}`
        );
      });
    });

    it('updates remaining seats and used seats', () => {
      cy.visit('/admin/users/moderators');
      cy.acceptCookies();

      // We get updated seat data from the API and use that to compare with the UI. This is to avoid using hardcoded values as those could be flaky depending on user data left by other tests in other files.
      cy.apiGetAppConfiguration().then((appConfigurationResponse) => {
        let additionalModerators =
          appConfigurationResponse.body.data.attributes.settings.core
            .additional_moderators_number;
        let maximumModerators =
          appConfigurationResponse.body.data.attributes.settings.core
            .maximum_moderators_number;

        cy.apiGetSeats().then((seatsResponse) => {
          let usedSeats = seatsResponse.body.data.attributes.moderators_number;
          let totalSeats = additionalModerators + maximumModerators;
          let remainingSeats = totalSeats - usedSeats;

          cy.dataCy('e2e-moderator-remaining-seats').contains(remainingSeats);
          cy.dataCy('e2e-moderator-used-seats').contains(usedSeats);
          cy.dataCy('e2e-moderator-total-seats').contains(totalSeats);

          // Navigate to the project permissions page
          cy.visit(`admin/projects/${projectId}/settings/access-rights`);

          // Add moderator and check that they are shown in the list
          cy.get('#projectModeratorUserSearch').should('exist');
          cy.get('#projectModeratorUserSearch').type(user7Email);
          cy.get(`[data-cy="e2e-user-${user7Email}"]`).click();
          cy.dataCy('e2e-add-project-moderator-button').click();
          testShowModalOnAddingModerator(usedSeats);
          cy.get('.e2e-admin-list').contains(user7Email);

          cy.visit('/admin/users/moderators');

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
            cy.dataCy('e2e-moderator-remaining-seats').contains(remainingSeats);
            cy.dataCy('e2e-moderator-used-seats').contains(usedSeats);
            cy.dataCy('e2e-moderator-total-seats').contains(totalSeats);
          });
        });
      });
    });
  });

  describe('with moderator seats (folder moderator)', () => {
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

    let noOfUsedModeratorSeats: number;

    before(() => {
      cy.apiCreateFolder(generateProjectFolder({})).then((folder) => {
        folderId = folder.body.data.id;
      });

      createUsers([
        {
          firstName: user8FirstName,
          lastName: user8LastName,
          email: user8Email,
          password: user8Password,
        },
        {
          firstName: user9FirstName,
          lastName: user9LastName,
          email: user9Email,
          password: user9Password,
        },
        {
          firstName: user10FirstName,
          lastName: user10LastName,
          email: user10Email,
          password: user10Password,
        },
        {
          firstName: user11FirstName,
          lastName: user11LastName,
          email: user11Email,
          password: user11Password,
        },
        {
          firstName: user12FirstName,
          lastName: user12LastName,
          email: user12Email,
          password: user12Password,
        },
        {
          firstName: user13FirstName,
          lastName: user13LastName,
          email: user13Email,
          password: user13Password,
        },
      ]);
    });

    beforeEach(() => {
      cy.apiGetSeats().then((reposnse) => {
        noOfUsedModeratorSeats =
          reposnse.body.data.attributes.moderators_number;
      });

      cy.setAdminLoginCookie();
    });

    after(() => {
      cleanUp();
      cy.apiRemoveFolder(folderId);
    });

    it('allows user to add a moderator and shows confirmation when needed', () => {
      cy.visit(`admin/projects/folders/${folderId}/permissions`);
      cy.acceptCookies();

      // Add moderator and check that they are shown in the list
      cy.get('#folderModeratorUserSearch').should('exist');
      cy.get('#folderModeratorUserSearch').type(user8Email);
      cy.get(`[data-cy="e2e-user-${user8Email}"]`).click();
      cy.dataCy('e2e-add-folder-moderator-button').click();
      testShowModalOnAddingModerator(noOfUsedModeratorSeats);
      cy.get('.e2e-admin-list').contains(user8Email);
      noOfUsedModeratorSeats = noOfUsedModeratorSeats + 1;

      // Add moderator and check that they are shown in the list
      cy.get('#folderModeratorUserSearch').should('exist');
      cy.get('#folderModeratorUserSearch').type(user9Email);
      cy.get(`[data-cy="e2e-user-${user9Email}"]`).click();
      cy.dataCy('e2e-add-folder-moderator-button').click();
      testShowModalOnAddingModerator(noOfUsedModeratorSeats);
      cy.get('.e2e-admin-list').contains(user9Email);
      noOfUsedModeratorSeats = noOfUsedModeratorSeats + 1;

      // Add moderator and check that they are shown in the list
      cy.get('#folderModeratorUserSearch').should('exist');
      cy.get('#folderModeratorUserSearch').type(user10Email);
      cy.get(`[data-cy="e2e-user-${user10Email}"]`).click();
      cy.dataCy('e2e-add-folder-moderator-button').click();
      testShowModalOnAddingModerator(noOfUsedModeratorSeats);
      cy.get('.e2e-admin-list').contains(user10Email);
      noOfUsedModeratorSeats = noOfUsedModeratorSeats + 1;

      // Add moderator and check that they are shown in the list
      cy.get('#folderModeratorUserSearch').should('exist');
      cy.get('#folderModeratorUserSearch').type(user11Email);
      cy.get(`[data-cy="e2e-user-${user11Email}"]`).click();
      cy.dataCy('e2e-add-folder-moderator-button').click();
      testShowModalOnAddingModerator(noOfUsedModeratorSeats);
      cy.get('.e2e-admin-list').contains(user11Email);
    });

    it('updates admin and moderators number', () => {
      cy.visit('/admin/users/moderators');
      cy.acceptCookies();

      cy.apiGetUsersCount().then((response) => {
        adminCount = response.body.data.attributes.administrators_count;
        moderatorsCount = response.body.data.attributes.moderators_count;
        cy.dataCy('e2e-admin-count').contains(`${adminCount}`);

        cy.dataCy('e2e-moderator-count').contains(`${moderatorsCount}`);

        // Navigate to the folder permissions page
        cy.visit(`admin/projects/folders/${folderId}/permissions`);

        // Add moderator and check that they are shown in the list
        cy.get('#folderModeratorUserSearch').should('exist');
        cy.get('#folderModeratorUserSearch').type(user12Email);
        cy.get(`[data-cy="e2e-user-${user12Email}"]`).click();
        cy.dataCy('e2e-add-folder-moderator-button').click();
        testShowModalOnAddingModerator(noOfUsedModeratorSeats);
        cy.get('.e2e-admin-list').contains(user12Email);

        cy.visit('/admin/users/moderators');
        cy.dataCy('e2e-moderator-count').contains(
          `${response.body.data.attributes.moderators_count + 1}`
        );
      });
    });

    it('updates remaining seats and used seats', () => {
      cy.visit('/admin/users/moderators');
      cy.acceptCookies();
      // We get updated seat data from the API and use that to compare with the UI. This is to avoid using hardcoded values as those could be flaky depending on user data left by other tests in other files.
      cy.apiGetAppConfiguration().then((appConfigurationResponse) => {
        let additionalModerators =
          appConfigurationResponse.body.data.attributes.settings.core
            .additional_moderators_number;
        let maximumModerators =
          appConfigurationResponse.body.data.attributes.settings.core
            .maximum_moderators_number;

        cy.apiGetSeats().then((seatsResponse) => {
          let usedSeats = seatsResponse.body.data.attributes.moderators_number;
          let totalSeats = additionalModerators + maximumModerators;
          let remainingSeats = totalSeats - usedSeats;

          cy.dataCy('e2e-moderator-remaining-seats').contains(
            `${remainingSeats}`
          );
          cy.dataCy('e2e-moderator-used-seats').contains(`${usedSeats}`);
          cy.dataCy('e2e-moderator-total-seats').contains(`${totalSeats}`);

          // Navigate to the folder permissions page
          cy.visit(`admin/projects/folders/${folderId}/permissions`);

          // Add moderator and check that they are shown in the list
          cy.get('#folderModeratorUserSearch').should('exist');
          cy.get('#folderModeratorUserSearch').type(user13Email);
          cy.get(`[data-cy="e2e-user-${user13Email}"]`).click();
          cy.dataCy('e2e-add-folder-moderator-button').click();
          testShowModalOnAddingModerator(usedSeats);
          cy.get('.e2e-admin-list').contains(user13Email);

          cy.visit('/admin/users/moderators');

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
            cy.dataCy('e2e-moderator-remaining-seats').contains(remainingSeats);
            cy.dataCy('e2e-moderator-used-seats').contains(usedSeats);
            cy.dataCy('e2e-moderator-total-seats').contains(totalSeats);
          });
        });
      });
    });
  });
});
