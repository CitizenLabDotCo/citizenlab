import { randomString } from '../../../support/commands';

describe('Admin: add projects to folder', () => {
  let projectId1: string;
  let projectId2: string;
  let projectTitle1 = randomString();
  let projectDescription = randomString();
  let projectTitle2 = randomString();

  beforeEach(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle1,
      descriptionPreview: projectDescription,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectId1 = project.body.data.id;
    });

    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle2,
      descriptionPreview: projectDescription,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectId2 = project.body.data.id;
    });

    cy.setAdminLoginCookie();
    cy.visit('/admin/projects/');
    cy.acceptCookies();
  });

  it('creates a new folder', () => {
    cy.get('[data-cy="e2e-new-project-folder-button"]').click();
    const folderTitle = randomString();
    const folderShortDescription = randomString();
    const folderDescription = randomString();

    // Add folder title
    cy.get('[data-cy="e2e-project-folder-title"]')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.get('#project-folder-title').type(folderTitle);
      });

    // Add folder short description
    cy.get('[data-cy="e2e-project-folder-short-description"]')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.get('[data-cy="e2e-project-folder-short-description"]').within(
          () => {
            cy.get('textarea').type(folderShortDescription);
          }
        );
      });

    // Add folder description
    cy.get('[data-cy="e2e-project-folder-description"]')
      .find('.e2e-localeswitcher')
      .each((button) => {
        cy.wrap(button).click();
        cy.get('[data-cy="e2e-project-folder-description"]').within(() => {
          cy.get('#description').type(folderShortDescription);
        });
      });

    // Submit project
    cy.get('.e2e-submit-wrapper-button').click();

    // Wait for folder page to load
    cy.get('.e2e-resource-header').contains(folderTitle);

    // Check that our projects are in the list and add them to the folder
    cy.get(`[data-cy="e2e-manage-button-${projectId1}"]`).should('exist');
    cy.get(`[data-cy="e2e-manage-button-${projectId1}"]`)
      .find('button')
      .click();
    cy.get(`[data-cy="e2e-manage-button-${projectId2}"]`).should('exist');
    cy.get(`[data-cy="e2e-manage-button-${projectId2}"]`)
      .find('button')
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

  afterEach(() => {
    cy.apiRemoveProject(projectId1);
    cy.apiRemoveProject(projectId2);
  });
});
