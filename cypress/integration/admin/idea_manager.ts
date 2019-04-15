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

      // create project assigned to signed-in admin/user
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

describe('Need feedback toggle', () => {

});

describe('Idea preview ', () => {

});

describe('Idea preview ', () => {

});
