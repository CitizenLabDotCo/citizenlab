import { randomString, randomEmail } from '../../support/commands';

beforeEach(() => {
  cy.login('admin@citizenlab.co', 'testtest');
});

// describe('Assignee filter', () => {
//   it('Filters on All initiatives', () => {
//     cy.visit('/admin/initiatives/manage');

//     // grab and open assignee filter menu
//     cy.get('#e2e-select-assignee-filter').click();
//     // click on All initiatives filter
//     cy.get('#e2e-assignee-filter-all-posts').click();
//     // check that number of initiatives on first page is 2
//     cy.get('.e2e-idea-manager-idea-row').should('have.length', 2);
//   });
//  it('Filters on Assigned to me', () => {

//     cy.getAuthUser().then((user) => {
//       const userId = user.body.data.id;

//       // create initiative with signed-in admin/user as default assignee
//       const initiativeTitle = randomString();
//       const initiativeContent = randomString();

//       cy.apiCreateInitiative(initiativeTitle, initiativeContent, userId);

//       // do a refresh for the new initiative to appear
//       cy.visit('/admin/initiatives/manage');
//       // grab and open assignee filter menu
//       cy.get('#e2e-select-assignee-filter').click();
//       // click on Assigned to me filter
//       cy.get('#e2e-assignee-filter-assigned-to-user').click();
//       // Check whether the newly created idea is assigned to the user
//       cy.get('.e2e-initiative-row').contains(initiativeTitle);
//     });
//   });
// });

// TODO: Need feedback toggle test (i3)

// describe('Need feedback toggle', () => {
//   before(() => {
//     cy.getAuthUser().then((user) => {
//       const userId = user.body.data.id;

//       const initiativeTitle1 = randomString();
//       const initiativeContent1 = randomString();
//       const initiativeTitle2 = randomString();
//       const initiativeContent2 = randomString();

//       // create initiative with signed-in admin/user as default assignee and give feedback
//       cy.apiCreateInitiative(initiativeTitle1, initiativeContent1, userId).then(initiative => {
//         const initiativeId = initiative.body.data.id;
//         const officialFeedbackContent = randomString();
//         const officialFeedbackAuthor = randomString();
//         cy.apiCreateOfficialFeedbackForInitiative(initiativeId, officialFeedbackContent, officialFeedbackAuthor);
//       });

//       // create second initiative with same assignee but no feedback (so feedback is still needed)
//       cy.apiCreateInitiative(initiativeTitle2, initiativeContent2, userId);
//     });
//   });

//   it('Filters on ideas that need feedback', () => {
//     cy.visit('/admin/initiatives/manage');

//     // grab and open assignee filter menu
//     cy.get('#e2e-select-assignee-filter').click();
//     // click on Assigned to me filter
//     cy.get('#e2e-assignee-filter-assigned-to-user').click();
//     cy.visit('/admin/initiatives/manage');

//     // Turn the 'need feedback' toggle on and check whether it only shows the idea assigned to user without official feedback
//     cy.get('#e2e-feedback_needed_filter_toggle').click();
//     cy.get('.e2e-initiative-row').should('have.length', 1);
//   });
// });

// describe('Initiative preview ', () => {
//   it('Opens when you click an initiative title and closes again when you click the X (close button)', () => {
//     cy.visit('/admin/initiatives/manage/');
//     // grab and open assignee filter menu
//     cy.get('#e2e-select-assignee-filter').click();
//     // click on All ideas filter
//     cy.get('#e2e-assignee-filter-all-posts').click();
//     // click on title of first initiative
//     cy.get('.e2e-initiative-manager-initiative-title').first().click().then(initiativeTitle => {
//       // check if the modal popped out and has the initiative in it
//       cy.get('#e2e-side-modal-content').find('#e2e-initiative-title').contains(initiativeTitle.text());
//     });
//     // close modal
//     cy.get('.e2e-modal-close-button').click();
//     // check if the modal is no longer on the page
//     cy.get('#e2e-modal-container').should('have.length', 0);
//   });
// });

describe('Assignee select', () => {
  it('Assigns a user to an idea', () => {
    const firstName = randomString(5);
    const lastName = randomString(5);
    const email = randomEmail();
    const password = randomString();

    cy.apiCreateAdmin(firstName, lastName, email, password).then(newAdmin => {
      const newAdminFirstName = newAdmin.body.data.attributes.first_name;
      const newAdminLastName = newAdmin.body.data.attributes.last_name;

      // Refresh page to make sure new admin is picked up
      cy.visit('/admin/initiatives/manage/');
      // Select unassigned in assignee filter
      cy.get('#e2e-select-assignee-filter').click();
      cy.get('#e2e-assignee-filter-unassigned').click();
      // Pick first idea in initiative table and assign it to our user
      cy.wait(500);
      cy.get('.e2e-initiative-row').first()
        .find('.e2e-post-manager-post-row-assignee-select').scrollIntoView().click()
        .contains(`${newAdminFirstName} ${newAdminLastName}`).click();
      // Select this user in the assignee filter
      cy.get('#e2e-select-assignee-filter').click()
        .find('.e2e-assignee-filter-other-user')
        .contains(`Assigned to ${newAdminFirstName} ${newAdminLastName}`).click();
      cy.wait(500);
      // Check if initiative is there
      cy.get('.e2e-initiative-row').should('have.length', 1);
    });
  });
});
