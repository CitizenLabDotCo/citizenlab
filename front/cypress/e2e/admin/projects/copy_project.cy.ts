import { data } from 'cypress/types/jquery';
import { randomString } from '../../../support/commands';

describe('Copy projects outside folder', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  let projectId: string;

  beforeEach(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
    });

    cy.setAdminLoginCookie();
  });

  afterEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('allows user to copy project', () => {
    cy.visit('/admin/projects/all');
    cy.acceptCookies();

    cy.get('#e2e-admin-projects-list-unsortable')
      .children()
      .first()
      .contains(projectTitle);

    cy.get('[data-testid="moreOptionsButton"]').first().should('exist');
    cy.get('[data-testid="moreOptionsButton"]').first().click();

    cy.intercept(`**/projects/${projectId}/copy`).as('copyProject');
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');

    cy.contains('Copy project').should('exist');
    cy.contains('Copy project').click();

    cy.wait('@copyProject');
    cy.wait('@getAdminPublications');

    // A draft project is created and appears at the top of the list
    cy.contains(`${projectTitle} - Copy`).should('exist');
    cy.get('#e2e-admin-projects-list-unsortable')
      .children()
      .first()
      .contains(`${projectTitle} - Copy`);
    cy.get('#e2e-admin-projects-list-unsortable')
      .children()
      .first()
      .contains('Draft');
  });
});

describe('Copy projects inside folder', () => {
  const projectTitle = randomString();
  const folderTitle = randomString();
  const folderShortDescription = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  let projectId: string;
  let folderId: string;

  beforeEach(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
    });

    cy.setAdminLoginCookie();
  });

  afterEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
    if (folderId) {
      cy.apiRemoveFolder(folderId);
    }
  });

  it('allows user to copy project in folder', () => {
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');
    cy.intercept(`**/projects/${projectId}/copy`).as('copyProject');

    cy.apiCreateFolder({
      title: folderTitle,
      descriptionPreview: folderShortDescription,
      description: randomString(),
      publicationStatus: 'published',
    }).then((folder) => {
      folderId = folder.body.data.id;
      cy.apiAddProjectsToFolder([projectId], folderId);

      cy.visit('/admin/projects/all');
      cy.acceptCookies();

      cy.wait('@getAdminPublications');
      cy.wait(5000);

      cy.get('#e2e-admin-projects-list-unsortable')
        .children()
        .first()
        .contains(folderTitle)
        .click({ force: true });

      cy.get('#e2e-admin-projects-list-unsortable')
        .children()
        .first()
        .contains(projectTitle);

      cy.get('[data-testid="moreOptionsButton"]').eq(1).should('exist');
      cy.get('[data-testid="moreOptionsButton"]').eq(1).click();

      cy.contains('Copy project').should('exist');
      cy.contains('Copy project').click();

      cy.wait('@copyProject');
      cy.wait('@getAdminPublications');

      // A draft project is created in the folder
      cy.contains(`${projectTitle} - Copy`).should('exist');
      cy.get('#e2e-admin-projects-list-unsortable')
        .children()
        .first()
        .contains(`${projectTitle} - Copy`);
      cy.get('#e2e-admin-projects-list-unsortable')
        .children()
        .first()
        .contains('Draft');
    });
  });
});
