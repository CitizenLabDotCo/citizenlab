import { randomString } from '../support/commands';

describe('Project selection page', () => {
  const projectOneTitle = randomString();
  const projectTwoTitle = randomString();
  const folderTitle = randomString();
  const folderDescription = randomString(30);
  let projectOneId: string;
  let projectTwoId: string;
  let folderId: string;
  let folderSlug: string;

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
          descriptionPreview: randomString(30),
          description: folderDescription,
          publicationStatus: 'published',
        }).then((folder) => {
          folderId = folder.body.data.id;
          folderSlug = folder.body.data.attributes.slug;

          cy.apiAddProjectsToFolder([projectOneId, projectTwoId], folderId);
        });
      });
    });
  });

  beforeEach(() => {
    cy.visit(`/folders/${folderSlug}`);
    cy.get('#e2e-folder-page');
    cy.acceptCookies();
    cy.wait(500);
  });

  it('shows the page', () => {
    cy.get('#e2e-folder-page');
  });

  it('shows the folder title', () => {
    cy.get('#e2e-folder-title').contains(folderTitle);
  });

  it('shows the folder description', () => {
    cy.get('.e2e-folder-description').contains(folderDescription);
  });

  it('shows the contained projects', () => {
    cy.get('#e2e-folder-page');
    cy.wait(4000); // without it sometimes the selector '.e2e-project-card-project-title' is executed
    // when only one project is loaded. So, it never finds the project 1.
    cy.get('.e2e-project-card-project-title').eq(0).contains(projectTwoTitle);
    cy.get('.e2e-project-card-project-title').eq(1).contains(projectOneTitle);
  });

  after(() => {
    cy.apiRemoveFolder(folderId);
  });
});
