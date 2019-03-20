import { randomString } from '../support/commands';

describe('Ideas overview page', () => {
  context('Project filter', () => {

    it('filters correctly on 1 project', () => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = randomString();
      const ideaTitle = randomString();
      const ideaContent = randomString();

      cy.apiCreateProject('continuous', projectTitle, projectDescriptionPreview, projectDescription).then((project) => {
        const projectId = project.body.data.id;
        cy.apiCreateIdea(projectId, ideaTitle, ideaContent);

        cy.visit('/ideas');

        cy.get('#e2e-project-filter-selector').click();
        // select project
        cy.get('.e2e-filter-list-item').contains(projectTitle).click();
        // contains only ideas from this project, including a specific check to make sure it's not just the number of ideas that's right
        cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle);
      });
    });

    it('filters correctly on 2 projects', () => {
      const projectTitle1 = randomString();
      const projectTitle2 = randomString();
      const projectDescriptionPreview1 = randomString();
      const projectDescriptionPreview2 = randomString();
      const projectDescription1 = randomString();
      const projectDescription2 = randomString();
      const ideaTitle1 = randomString();
      const ideaTitle2 = randomString();
      const ideaContent1 = randomString();
      const ideaContent2 = randomString();
      let projectId1: string;
      let projectId2: string;

      cy.apiCreateProject('continuous', projectTitle1, projectDescriptionPreview1, projectDescription1).then((project1) => {
        projectId1 = project1.body.data.id;
        return cy.apiCreateProject('continuous', projectTitle2, projectDescriptionPreview2, projectDescription2);
      }).then((project2) => {
        projectId2 = project2.body.data.id;
        cy.apiCreateIdea(projectId1, ideaTitle1, ideaContent1);
        cy.apiCreateIdea(projectId2, ideaTitle2, ideaContent2);
        cy.visit('/ideas');
        cy.get('#e2e-project-filter-selector').click();
        cy.get('.e2e-filter-list-item').contains(projectTitle1).click();
        cy.get('.e2e-filter-list-item').contains(projectTitle2).click();
        cy.get('#e2e-project-filter-selector').click();
        cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle1);
        cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle2);
      });
    });
  });
});
