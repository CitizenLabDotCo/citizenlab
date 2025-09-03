import { randomString } from '../support/commands';

describe('Project selection page', () => {
  const folderTitle = randomString();
  const folderShortDescription = randomString(30);
  let projectOneId: string;
  let projectTwoId: string;
  let folderId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    }).then((projectOne) => {
      projectOneId = projectOne.body.data.id;
      cy.apiCreateProject({
        title: randomString(),
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

          cy.apiAddProjectsToFolder([projectOneId, projectTwoId], folderId);
        });
      });
    });
  });

  it.skip('shows the title, description, progress bar and cta', () => {
    cy.goToLandingPage();

    cy.get('.e2e-folder-card')
      .contains(folderTitle)
      .closest('.e2e-folder-card')
      .as('folderCard');
    cy.get('@folderCard')
      .get('.e2e-folder-card-folder-title')
      .contains(folderTitle);
    cy.get('@folderCard')
      .get('.e2e-folder-card-folder-description-preview')
      .contains(folderShortDescription);
    cy.get('@folderCard')
      .get('.e2e-folder-card-numberofprojects')
      .contains('2');
  });

  after(() => {
    cy.apiRemoveFolder(folderId);
  });
});
