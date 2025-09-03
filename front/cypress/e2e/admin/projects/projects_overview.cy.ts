import { randomEmail, randomString } from '../../../support/commands';

describe('Projects overview: admin (projects)', () => {
  const title = randomString();
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      title,
      description: randomString(),
    }).then((response) => {
      projectId = response.body.data.id;
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('Loads the projects overview page', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');
    cy.dataCy('projects-overview-table-row').should('have.length.at.least', 10);
  });

  it('Sorts by created date (desc)', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');

    // Set sort
    cy.dataCy('projects-overview-sort-select').select('recently_created_desc');

    // Assert that the first project is the one we created
    cy.dataCy('projects-overview-table-row').first().contains(title);
  });

  it('Persists filters from projects tab to calendar tab', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');

    // Add filter
    cy.dataCy('projects-overview-add-filter-button').click();
    cy.dataCy('projects-overview-add-filter-status').click();

    // Select published
    cy.dataCy('multiselect-option-published').click();

    // Switch to calendar tab
    cy.dataCy('projects-overview-calendar-tab').click();

    // Assert that the filter is still there
    cy.dataCy('projects-overview-filter-status').should('exist');
    cy.dataCy('projects-overview-filter-status').contains('Status: Published');
  });
});

describe('Projects overview: admin (folders)', () => {
  const folderTitle = randomString();
  let folderId: string;

  before(() => {
    cy.apiCreateFolder({
      title: folderTitle,
      description: randomString(),
    }).then((response) => {
      folderId = response.body.data.id;
    });
  });

  after(() => {
    cy.apiRemoveFolder(folderId);
  });

  it('Finds folder through search', () => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/projects');
    cy.dataCy('projects-overview-folders-tab').click();

    cy.dataCy('projects-overview-search-input').type(folderTitle);
    cy.dataCy('projects-overview-folder-table-row').should('have.length', 1);
    cy.dataCy('projects-overview-folder-table-row')
      .first()
      .contains(folderTitle);
  });
});

describe('Projects overview: project moderator', () => {
  let projectId: string;
  let userId: string;
  const projectTitle = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.apiCreateModeratorForProject({
        firstName: 'John',
        lastName: 'Doe',
        email,
        password,
        projectId,
      }).then((moderator) => {
        userId = moderator.body.data.id;
      });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  it('shows projects you can moderate', () => {
    cy.setLoginCookie(email, password);
    cy.visit('/admin/projects');
    cy.dataCy('projects-overview-table-row').should('have.length', 1);
    cy.dataCy('projects-overview-table-row').first().contains(projectTitle);
  });

  it('does not show folders tab', () => {
    cy.setLoginCookie(email, password);
    cy.visit('/admin/projects');
    cy.dataCy('projects-overview-folders-tab').should('not.exist');
  });
});

describe('Projects overview: folder moderator', () => {
  let userId: string;
  let projectOneId: string;
  let projectTwoId: string;
  let folderId: string;

  const projectOneTitle = randomString();
  const projectTwoTitle = randomString();
  const folderTitle = randomString();
  const folderShortDescription = randomString(30);
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiCreateProject({
      title: projectOneTitle,
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    }).then((projectOne) => {
      projectOneId = projectOne.body.data.id;
      cy.apiCreateProject({
        title: projectTwoTitle,
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'published',
      }).then((projectTwo) => {
        projectTwoId = projectTwo.body.data.id;
        cy.apiCreateFolder({
          title: folderTitle,
          descriptionPreview: folderShortDescription,
          description: randomString(),
          publicationStatus: 'published',
        }).then((folder) => {
          folderId = folder.body.data.id;

          cy.apiAddProjectsToFolder(
            [projectOneId, projectTwoId],
            folderId
          ).then(() => {
            cy.apiCreateModeratorForFolder({
              firstName: 'John',
              lastName: 'Doe',
              email,
              password,
              folderId,
            }).then((moderator) => {
              userId = moderator.body.data.id;
            });
          });
        });
      });
    });
  });

  it('shows projects in the folder you can moderate', () => {
    cy.setLoginCookie(email, password);
    cy.visit('/admin/projects');
    cy.dataCy('projects-overview-table-row').should('have.length', 2);

    // Set sort
    cy.dataCy('projects-overview-sort-select').select('recently_created_asc');

    // Make sure projects are in the correct order
    cy.dataCy('projects-overview-table-row').first().contains(projectOneTitle);
    cy.dataCy('projects-overview-table-row').last().contains(projectTwoTitle);
  });

  it('shows folders you can moderate', () => {
    cy.setLoginCookie(email, password);
    cy.visit('/admin/projects');
    cy.dataCy('projects-overview-folders-tab').click();
    cy.dataCy('projects-overview-folder-table-row').should('have.length', 1);
    cy.dataCy('projects-overview-folder-table-row')
      .first()
      .contains(folderTitle);
  });
});
