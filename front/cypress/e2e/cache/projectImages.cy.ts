import { randomString } from '../../support/commands';
import { base64 } from '../../fixtures/base64img';

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
      cy.uploadProjectFolderImage(folderId, base64);
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

    // If the card title is found, the project folder image should already have been
    // taken out of the cache (or a request would have been made if there is a bug)
    cy.get('.e2e-folder-card-folder-title > span').contains(title);

    // But, just to be sure, we will wait 5 more seconds
    cy.wait(5000);
  });
});
