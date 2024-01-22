import { ProposalsSettings } from '../../../app/api/app_configuration/types';
import { randomString, randomEmail } from '../../support/commands';

describe('Initiative manager', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  describe('Assignee filter', () => {
    const firstName1 = randomString();
    const firstName2 = randomString();
    const lastName1 = randomString();
    const lastName2 = randomString();
    const email1 = randomEmail();
    const email2 = randomEmail();
    const password1 = randomString();
    const password2 = randomString();
    const initiativeTitle1 = randomString();
    const initiativeTitle2 = randomString();
    // create initiative with signed-in admin/user as default assignee
    const initiativeAssignedToUserTitle = randomString();
    const initiativeAssignedToUserContent = randomString();
    const initiativeContent1 = randomString();
    const initiativeContent2 = randomString();
    let initiativeId1: string;
    let initiativeId2: string;
    let initiativeId3: string;
    let adminUserId1: string;
    let adminUserId2: string;

    before(() => {
      // create two extra initiatives, with different assignees
      // so we can check with greater certainty that all initiatives are being show in the tests
      cy.apiCreateAdmin(firstName1, lastName1, email1, password1).then(
        (user) => {
          adminUserId1 = user.body.data.id;
          cy.apiCreateInitiative({
            initiativeTitle: initiativeTitle1,
            initiativeContent: initiativeContent1,
            assigneeId: adminUserId1,
          }).then((initiative) => {
            initiativeId1 = initiative.body.data.id;
          });
        }
      );

      cy.apiCreateAdmin(firstName2, lastName2, email2, password2).then(
        (user) => {
          adminUserId2 = user.body.data.id;
          cy.apiCreateInitiative({
            initiativeTitle: initiativeTitle2,
            initiativeContent: initiativeContent2,
            assigneeId: adminUserId2,
          }).then((initiative) => {
            initiativeId2 = initiative.body.data.id;
          });
        }
      );

      cy.getAuthUser().then((user) => {
        const userId = user.body.data.id;

        cy.apiCreateInitiative({
          initiativeTitle: initiativeAssignedToUserTitle,
          initiativeContent: initiativeAssignedToUserContent,
          assigneeId: userId,
        }).then((initiative) => {
          initiativeId3 = initiative.body.data.id;
          cy.wait(500);
        });
      });
    });

    after(() => {
      cy.apiRemoveInitiative(initiativeId1);
      cy.apiRemoveInitiative(initiativeId2);
      cy.apiRemoveInitiative(initiativeId3);
      cy.apiRemoveUser(adminUserId1);
      cy.apiRemoveUser(adminUserId2);
    });

    it('Filters on All initiatives', () => {
      cy.visit('/admin/initiatives/');
      // grab and open assignee filter menu
      cy.get('#e2e-select-assignee-filter').click();
      // click on All initiatives filter
      cy.get('#e2e-assignee-filter-all-posts').click();
      cy.wait(500);
      // check that number of initiatives on first page is 5,
      // the number of initiatives in the e2e seed file + three newly created initiatives for tests
      cy.get('.e2e-initiative-row').should('have.length', 5);
    });
    it('Filters on Assigned to me', () => {
      // do a refresh for the new initiative to appear
      cy.visit('/admin/initiatives');
      // grab and open assignee filter menu
      cy.get('#e2e-select-assignee-filter').click();
      // click on Assigned to me filter
      cy.get('#e2e-assignee-filter-assigned-to-user').click();
      // Check whether the newly created idea is assigned to the user
      cy.get('.e2e-initiative-row').should('have.length', 1);
    });
  });

  describe('Need feedback toggle', () => {
    let initiativeId1: string;
    let initiativeId2: string;
    let initialInitiativeSettings: ProposalsSettings;

    const moveInitiativeToThresholdReached = (initiativeId: string) => {
      cy.apiGetAppConfiguration().then((appConfig) => {
        initialInitiativeSettings =
          appConfig.body.data.attributes.settings.initiatives;
      });
      cy.apiUpdateAppConfiguration({
        settings: {
          initiatives: {
            ...initialInitiativeSettings,
            reacting_threshold: 2,
          },
        },
      });
      cy.apiLikeInitiative(
        // Only admin accounts are confirmed by default (see User#set_confirmation_required),
        // and so allowed to react to initiatives.
        'hello@citizenlab.co',
        'democrazy',
        initiativeId1
      );
    };

    before(() => {
      cy.getAuthUser().then((user) => {
        const userId = user.body.data.id;

        const initiativeTitle1 = randomString();
        const initiativeContent1 = randomString();
        const initiativeTitle2 = randomString();
        const initiativeContent2 = randomString();

        // create initiative with signed-in admin/user as default assignee and give feedback
        cy.apiCreateInitiative({
          initiativeTitle: initiativeTitle1,
          initiativeContent: initiativeContent1,
          assigneeId: userId,
        }).then((initiative) => {
          initiativeId1 = initiative.body.data.id;
          moveInitiativeToThresholdReached(initiativeId1);
        });

        // create second initiative with same assignee but no feedback (so feedback is still needed)
        cy.apiCreateInitiative({
          initiativeTitle: initiativeTitle2,
          initiativeContent: initiativeContent2,
          assigneeId: userId,
        }).then((initiative) => {
          initiativeId2 = initiative.body.data.id;
        });
      });
    });

    it('Filters on initiatives that need feedback', () => {
      cy.visit('/admin/initiatives');

      // grab and open assignee filter menu
      cy.get('#e2e-select-assignee-filter').click();
      // click on Assigned to me filter
      cy.get('#e2e-assignee-filter-assigned-to-user').click();

      // Turn the 'need feedback' toggle on and check whether it only shows the initiative assigned to user without official feedback
      cy.get('#e2e-feedback_needed_filter_toggle').click();
      cy.get('.e2e-initiative-row').should('have.length', 1);
    });
    after(() => {
      cy.apiRemoveInitiative(initiativeId1);
      cy.apiRemoveInitiative(initiativeId2);
      cy.apiUpdateAppConfiguration({
        settings: {
          initiatives: initialInitiativeSettings,
        },
      });
    });
  });

  describe('Initiative preview ', () => {
    it('Opens when you click an initiative title and closes again when you click the X (close button)', () => {
      cy.visit('/admin/initiatives/');
      // grab and open assignee filter menu
      cy.get('#e2e-select-assignee-filter').click();
      // click on All ideas filter
      cy.get('#e2e-assignee-filter-all-posts').click();
      // click on title of first initiative
      cy.get('.e2e-initiative-manager-initiative-title')
        .first()
        .click()
        .then((initiativeTitle) => {
          // check if the modal popped out and has the initiative in it
          cy.get('#e2e-side-modal-content')
            .find('#e2e-initiative-title')
            .contains(initiativeTitle.text());
        });
      // close modal
      cy.get('.e2e-modal-close-button').click();
      // check if the modal is no longer on the page
      cy.get('#e2e-modal-container').should('have.length', 0);
    });
  });

  describe('Assignee select', () => {
    const firstName = randomString(5);
    const lastName = randomString(5);
    const email = randomEmail();
    const password = randomString();
    const initiativeTitle = randomString();
    const initiativeContent = randomString();
    let initiativeId: string;
    let newAdminFirstName: string;
    let newAdminLastName: string;
    let adminUserId1: string;

    before(() => {
      cy.apiCreateInitiative({ initiativeTitle, initiativeContent }).then(
        (initiative) => {
          initiativeId = initiative.body.data.id;
        }
      );

      cy.apiCreateAdmin(firstName, lastName, email, password).then(
        (newAdmin) => {
          adminUserId1 = newAdmin.body.data.id;
          newAdminFirstName = newAdmin.body.data.attributes.first_name;
          newAdminLastName = newAdmin.body.data.attributes.last_name;
          cy.apiConfirmUser(email, password);
        }
      );
      cy.logout();
      cy.setAdminLoginCookie();
    });

    after(() => {
      cy.apiRemoveInitiative(initiativeId);
      cy.apiRemoveUser(adminUserId1);
    });

    it('Assigns a user to an initiative', () => {
      cy.visit('/admin/initiatives/');
      // grab and open assignee filter menu
      cy.get('#e2e-select-assignee-filter').click();
      // click on All initiatives filter
      cy.get('#e2e-assignee-filter-all-posts').click();
      cy.wait(500);
      cy.get('.e2e-initiative-row')
        .first()
        .find('#post-row-select-assignee')
        .click()
        .contains(`${newAdminFirstName} ${newAdminLastName}`)
        .click({ force: true });

      // Select this user in the assignee filter
      cy.get('#e2e-select-assignee-filter')
        .click()
        .find('.e2e-assignee-filter-other-user')
        .contains(`Assigned to ${newAdminFirstName} ${newAdminLastName}`)
        .click();
      cy.wait(500);
      // Check if initiative is there
      cy.get('.e2e-initiative-row').should('have.length', 1);
    });
  });

  describe('Tag filter', () => {
    it('navigates to the platform-wide tag settings when the user clicks "Edit tags" in the tags tab', () => {
      cy.visit('/admin/initiatives/');
      cy.get(
        '[data-cy="e2e-admin-post-manager-filter-sidebar-topics"]'
      ).click();
      cy.get('[data-cy="e2e-post-manager-topic-filters-edit-tags"]').click();

      cy.location('pathname').should('eq', `/en/admin/settings/topics`);
    });
  });
});
