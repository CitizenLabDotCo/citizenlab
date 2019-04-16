import { isString, get, first } from 'lodash-es';
import { randomString, randomEmail } from '../../support/commands';

beforeEach(() => {
  cy.login('admin@citizenlab.co', 'testtest');
});

describe('Assignee filter', () => {
  it('Filters on All ideas', () => {
    cy.visit('/admin/ideas/');

    // grab and open assignee filter menu
    cy.get('#e2e-idea-select-assignee-filter').click();
    // click on All ideas filter
    cy.get('#e2e-assignee-filter-all-ideas').click();
    // check that number of ideas on first page is 10
    cy.get('.e2e-idea-manager-idea-row').should('have.length', 10);
  });

  it('Filters on Assigned to me', () => {

    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = randomString();
      const userId = user.body.data.id;

      // create project with signed-in admin/user as default assignee
      cy.apiCreateProject('continuous', projectTitle, projectDescriptionPreview, projectDescription, 'published', userId).then((project) => {
        const projectId = project.body.data.id;
        const ideaTitle = randomString();
        const ideaContent = randomString();

        cy.apiCreateIdea(projectId, ideaTitle, ideaContent);

        // do a refresh for the new idea to appear
        cy.visit('/admin/ideas/');
        // grab and open assignee filter menu
        cy.get('#e2e-idea-select-assignee-filter').click();
        // click on Assigned to me filter
        cy.get('#e2e-assignee-filter-assigned-to-user').click();
        // Check whether the newly created idea is assigned to the user
        cy.get('.e2e-idea-manager-idea-row').contains(ideaTitle);
      });
    });
  });
});

// describe('Need feedback toggle', () => {
//   it('Filters on ideas that need feedback', () => {
//     cy.getAuthUser().then((user) => {
//       const projectTitle = randomString();
//       const projectDescriptionPreview = randomString();
//       const projectDescription = randomString();
//       const userId = user.body.data.id;

//       // create project explicitely without default assignee
//       cy.apiCreateProject('continuous', projectTitle, projectDescriptionPreview, projectDescription, 'published', 'unassigned').then((project) => {
//         const projectId = project.body.data.id;
//         const ideaTitle1 = randomString();
//         const ideaTitle2 = randomString();
//         const ideaContent1 = randomString();
//         const ideaContent2 = randomString();

//         // create idea explicitely with an assignee (logged-in user);
//         cy.apiCreateIdea(projectId, ideaTitle1, ideaContent1, userId);
//         cy.apiCreateIdea(projectId, ideaTitle2, ideaContent2);
//       });
//     });
//   });
// });

describe('Idea preview ', () => {
  it('Opens when you click an idea title', () => {
    cy.visit('/admin/ideas/');
    // grab and open assignee filter menu
    cy.get('#e2e-idea-select-assignee-filter').click();
    // click on All ideas filter
    cy.get('#e2e-assignee-filter-all-ideas').click();
    // click on title of first idea
    cy.get('.e2e-idea-manager-idea-title').first().click().then(ideaTitle => {
    // check if the modal popped out and has the idea in it
    cy.get('#e2e-modal-container').find('.e2e-ideatitle').contains(ideaTitle.text());
    });
  });

  it('Closes when you click the X (close button)', () => {
    cy.visit('/admin/ideas/');
    // grab and open assignee filter menu
    cy.get('#e2e-idea-select-assignee-filter').click();
    // click on All ideas filter
    cy.get('#e2e-assignee-filter-all-ideas').click();
    // click on title of first idea to open modal
    cy.get('.e2e-idea-manager-idea-title').first().click();
    // close modal
    cy.get('.e2e-modal-close-button').click();
    // check if the modal is no longer on the page
    cy.get('#e2e-modal-container').should('have.length', 0);
  });
});

describe('Assignee select', () => {
  it('Assigns a user to an idea', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    cy.apiCreateAdmin(firstName, lastName, email, password).then(newUser => {
      const newUserFirstName = newUser.body.data.attributes.first_name;
      const newUserLastName = newUser.body.data.attributes.last_name;

      // Refresh page to make sure new admin is picked up
      cy.visit('/admin/ideas/');
      // Select unassigned in assignee filter
      cy.get('#e2e-idea-select-assignee-filter').click();
      cy.get('#e2e-assignee-filter-unassigned').click();
      // Pick first idea in idea table and assign it to our user
      cy.wait(500);
      cy.get('.e2e-idea-manager-idea-row').first().then(ideaRow => {})
        .find('.e2e-idea-manager-idea-row-assignee-select').click()
        .contains(`${newUserFirstName} ${newUserLastName}`).click();
      // Select this user in the assignee filter
      cy.get('#e2e-idea-select-assignee-filter').click()
        .find('.e2e-assignee-filter-other-user')
        .contains(`Assigned to ${newUserFirstName} ${newUserLastName}`).click();
      // Check if idea is there
      cy.get('.e2e-idea-manager-idea-row').should('have.length', 1);
    });

  });
});
