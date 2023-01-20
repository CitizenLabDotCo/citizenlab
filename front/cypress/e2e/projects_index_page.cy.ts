import { randomString } from '../support/commands';

describe('Project overview page', () => {
  const projectTitleOne = randomString(12);
  const projectTitleTwo = randomString(12);
  const projectTitleThree = randomString(12);
  const projectTitleFour = randomString(12);
  const projectInFolderTitle = randomString(12);
  let projectInFolderId: string;
  const folderTitle = randomString(12);
  const projectIds: string[] = [];
  let folderId: string;

  // body content, not used for testing search
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  before(() => {
    // unique name/title
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitleOne,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectIds.push(project.body.data.id);
    });
    // shares content with project three
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitleTwo,
      descriptionPreview: projectDescriptionPreview,
      description: projectTitleThree,
      publicationStatus: 'published',
    }).then((project) => {
      projectIds.push(project.body.data.id);
    });
    // shares content with project two
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitleThree,
      descriptionPreview: projectDescriptionPreview,
      description: projectTitleTwo,
      publicationStatus: 'published',
    }).then((project) => {
      projectIds.push(project.body.data.id);
    });
    // archived project
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitleFour,
      descriptionPreview: projectDescriptionPreview,
      description: projectTitleTwo,
      publicationStatus: 'archived',
    }).then((project) => {
      projectIds.push(project.body.data.id);
    });

    // project in folder title
    cy.apiCreateProject({
      type: 'continuous',
      title: projectInFolderTitle,
      descriptionPreview: projectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectIds.push(project.body.data.id);
      projectInFolderId = project.body.data.id;
    });
    cy.apiCreateFolder({
      type: 'continuous',
      title: folderTitle,
      descriptionPreview: randomString(30),
      description: randomString(),
      publicationStatus: 'published',
    }).then((folder) => {
      folderId = folder.body.data.id;
      cy.apiAddProjectsToFolder([projectInFolderId], folderId);
    });
  });

  after(() => {
    projectIds.forEach((id) => {
      cy.apiRemoveProject(id);
    });
    cy.apiRemoveFolder(folderId);
  });

  it('shows the filtered projects based on the search input', () => {
    cy.intercept('GET', '**/admin_publications**').as('getAdminPublications');

    cy.visit('/projects/');

    cy.get('#e2e-projects-container');
    cy.get('.e2e-projects-list');
    cy.acceptCookies();

    // search for a unique project title
    cy.get('#search-input').type(projectTitleOne);

    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 1);

    // search for a title that exists in two active projects
    cy.get('#search-input').clear();
    cy.wait('@getAdminPublications');
    cy.get('#search-input').type(projectTitleTwo);

    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 2);

    // and one archived project
    cy.get('#project-cards-tab-archived').click();
    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 1);

    // check that the all tab reflects all 3
    cy.get('#project-cards-tab-all').click();
    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 3);

    // check that projects in folders appear in search
    cy.get('#search-input').clear().type(projectInFolderTitle);
    cy.get('#e2e-projects-container').should(
      'contain.text',
      projectInFolderTitle
    );
    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 1);

    // check that folders appear in search
    cy.get('#search-input').clear().type(folderTitle);
    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 1);
  });
});
