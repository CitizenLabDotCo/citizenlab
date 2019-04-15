import { isString, get } from 'lodash-es';
import { randomString } from '../../support/commands';

beforeEach(() => {
  cy.login('admin@citizenlab.co', 'testtest');
  cy.visit('/admin/ideas/');
});

describe('Assignee filter', () => {
  it('Filters on All ideas', () => {
    // grab and open assignee filter menu
    cy.get('#idea-select-assignee-filter').click();
    // click on All ideas filter
    cy.get('.item').contains('All ideas').click();
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
        cy.get('#idea-select-assignee-filter').click();
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

});
