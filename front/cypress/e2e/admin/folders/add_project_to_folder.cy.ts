import { randomString } from '../../../support/commands';

// works locally but not on CI. needs to be refactored to be stable on CI
describe.skip('Admin: add projects to folder', async () => {
  it('creates a new folder', () => {
    let projectId1: string;
    let projectId2: string;
    let projectTitle1 = randomString();
    let projectDescription = randomString();
    let projectTitle2 = randomString();

    cy.apiCreateProject({
      title: projectTitle1,
      descriptionPreview: projectDescription,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((projectOneResponse) => {
      projectId1 = projectOneResponse.body.data.id;
      cy.apiCreateProject({
        title: projectTitle2,
        descriptionPreview: projectDescription,
        description: projectDescription,
        publicationStatus: 'published',
      }).then((projectTwoResponse) => {
        projectId2 = projectTwoResponse.body.data.id;

        cy.setAdminLoginCookie();
        cy.visit('/admin/projects/all');
        cy.acceptCookies();

        cy.dataCy('e2e-new-project-folder-button').click();
        const folderTitle = randomString();
        const folderShortDescription = randomString();

        // Add folder title
        cy.dataCy('e2e-project-folder-title')
          .find('.e2e-localeswitcher')
          .each((button) => {
            cy.wrap(button).click();
            cy.get('#project-folder-title').type(folderTitle);
          });

        // Add folder short description
        cy.dataCy('e2e-project-folder-short-description')
          .find('.e2e-localeswitcher')
          .each((button) => {
            cy.wrap(button).click();
            cy.dataCy('e2e-project-folder-short-description').within(() => {
              cy.get('textarea').type(folderShortDescription);
            });
          });

        // Add folder description
        cy.dataCy('e2e-project-folder-description')
          .find('.e2e-localeswitcher')
          .each((button) => {
            cy.wrap(button).click();
            cy.dataCy('e2e-project-folder-description').within(() => {
              cy.get('#description').type(folderShortDescription);
            });
          });

        // Submit project
        cy.get('.e2e-submit-wrapper-button button').click();

        // Wait for folder page to load
        cy.get('.e2e-resource-header').contains(folderTitle);

        // Check that our projects are in the list and add them to the folder
        cy.get(`[data-cy="e2e-manage-button-${projectId1}"]`).should('exist');
        cy.get(`[data-cy="e2e-manage-button-${projectId1}"]`)
          .find('button')
          .scrollIntoView()
          .click();

        cy.get(`[data-cy="e2e-manage-button-${projectId2}"]`).should('exist');
        cy.get(`[data-cy="e2e-manage-button-${projectId2}"]`)
          .find('button')
          .scrollIntoView()
          .click();

        // Check that projects were successfuly added to folder
        cy.get('#e2e-admin-folders-projects-list')
          .contains(projectTitle1)
          .should('exist');
        cy.get('#e2e-admin-folders-projects-list')
          .contains(projectTitle2)
          .should('exist');

        // Navigate to the folder page
        cy.get('#to-projectFolder').click();

        // Check for correct content on folder page
        cy.get('#e2e-folder-page').contains(folderTitle).should('exist');
        cy.get('#e2e-folder-page').contains(projectTitle1).should('exist');
        cy.get('#e2e-folder-page').contains(projectTitle2).should('exist');
      });
    });
  });
});
