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
    cy.visit('/admin/projects');

    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');
    cy.dataCy('projects-overview-table-row').first().contains(projectTitle);

    cy.get('[data-testid="moreOptionsButton"]').first().should('exist');
    cy.get('[data-testid="moreOptionsButton"]').first().click();

    cy.intercept(`**/projects/${projectId}/copy`).as('copyProject');
    cy.intercept('GET', '**/projects/for_admin**').as('getProjectsForAdmin');

    cy.contains('Copy project').should('exist');
    cy.contains('Copy project').click();

    cy.wait('@copyProject');
    cy.wait('@getProjectsForAdmin');

    // A draft project is created and appears at the top of the list
    cy.contains(`${projectTitle} - Copy`).should('exist');
    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');

    cy.dataCy('projects-overview-table-row')
      .first()
      .contains(`${projectTitle} - Copy`);

    cy.dataCy('projects-overview-table-row').first().contains('Draft');
  });
});
