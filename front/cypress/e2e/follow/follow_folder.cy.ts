import { randomString, randomEmail } from '../../support/commands';

describe('Follow folder', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const folderTitle = randomString();
  const folderShortDescription = randomString(60);
  let userId: string;
  let folderId: string;
  let folderSlug: string;
  let userSlug: string;

  before(() => {
    cy.apiCreateFolder({
      title: folderTitle,
      descriptionPreview: folderShortDescription,
      description: randomString(),
      publicationStatus: 'published',
    }).then((folder) => {
      folderId = folder.body.data.id;
      folderSlug = folder.body.data.attributes.slug;
    });

    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
      userSlug = response.body.data.attributes.slug;
    });
  });

  after(() => {
    if (userId) {
      cy.apiRemoveUser(userId);
    }
    if (folderId) {
      cy.apiRemoveFolder(folderId);
    }
  });

  it('shows a follow option and an unfollow option after following', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/folders/${folderSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-folder-title').contains(folderTitle);

    // Follow
    cy.dataCy('e2e-follow-button').should('exist');
    cy.dataCy('e2e-follow-button').click();

    // Check that it shows unfollow after
    cy.dataCy('e2e-unfollow-button').should('exist');
    cy.dataCy('e2e-follow-button').should('not.exist');
  });
});
