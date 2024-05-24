import { randomString } from '../../support/commands';

// describe('Project images', () => {

// });

describe('Project folder images', () => {
  const title = randomString();
  let folderId: string;

  before(() => {
    cy.apiCreateFolder({
      title,
      descriptionPreview: randomString(30),
      description: randomString(),
      publicationStatus: 'published',
    }).then((folder) => {
      folderId = folder.body.data.id;
    });
  });

  after(() => {
    cy.apiRemoveFolder(folderId);
  });

  it('does not request project folder images because they are already in the cache', () => {
    cy.intercept('/web_api/v1/project_folders/**', (req) => {
      if (req.url.includes('images')) {
        throw new Error(
          'This request should not be made. The project folder images should be in the cache already'
        );
      }
    });

    cy.goToLandingPage();
    cy.get('.e2e-folder-card-folder-title').contains(title);
    cy.wait(10000);
  });
});
