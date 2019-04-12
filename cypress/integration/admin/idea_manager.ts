import { isString, get } from 'lodash-es';
import { randomString, getUserBySlug } from '../../support/commands';

before(() => {
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

    // Create idea
    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    const ideaTitle = randomString();
    const ideaContent = randomString();

    cy.apiCreateProject('continuous', projectTitle, projectDescriptionPreview, projectDescription).then((project) => {
      const projectId = project.body.data.id;
      const assigneeId = getUserBySlug('')
      cy.apiCreateIdea(projectId, ideaTitle, ideaContent);

      // grab and open assignee filter menu
      cy.get('#idea-select-assignee-filter').click();
      // click on Assigned to me filter
      cy.get('.item').contains('Assigned to me').click();

      cy.get('.e2e-filter-list-item').contains(projectTitle).click();
      // check that the filter only shows idea from our project and check if its title matches
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 1).contains(ideaTitle);
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
