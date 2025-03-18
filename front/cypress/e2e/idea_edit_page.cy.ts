import { randomString, randomEmail } from '../support/commands';

describe('Idea edit page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const ideaTitle = randomString(40);
  const ideaContent = randomString(60);
  const newIdeaTitle = randomString(40);
  const newIdeaContent = randomString(60);
  let jwt: string;
  let projectId: string;
  let ideaId: string;
  let ideaSlug: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        return cy.apiLogin(email, password);
      })
      .then((user) => {
        jwt = user.body.jwt;
        return cy.getProjectBySlug('an-idea-bring-it-to-your-council');
      })
      .then((project) => {
        projectId = project.body.data.id;
      });
  });

  beforeEach(() => {
    cy.apiCreateIdea({ projectId, ideaTitle, ideaContent, jwt }).then(
      (idea) => {
        ideaId = idea.body.data.id;
        ideaSlug = idea.body.data.attributes.slug;
      }
    );
  });

  afterEach(() => {
    if (ideaId) {
      cy.apiRemoveIdea(ideaId);
    }
  });

  it('has a working idea edit form', () => {
    cy.setLoginCookie(email, password);

    // check original values
    cy.visit(`/ideas/${ideaSlug}`);
    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-title').contains(ideaTitle);
    cy.get('#e2e-idea-description').contains(ideaContent);

    // go to form
    cy.visit(`/ideas/edit/${ideaId}`);
    cy.acceptCookies();

    cy.get('#e2e-idea-edit-page');
    cy.get('#idea-form', { timeout: 100000 });
    cy.get('#e2e-idea-title-input input').as('titleInput');
    cy.get('#e2e-idea-description-input .ql-editor').as('descriptionInput');

    // check initial form values
    cy.get('@titleInput').should('exist');
    cy.get('@descriptionInput').should('exist');
    cy.get('@titleInput').should('contain.value', ideaTitle);
    cy.get('@descriptionInput').contains(ideaContent);

    // edit title and description
    cy.get('@titleInput').clear();
    cy.get('@descriptionInput').clear();

    cy.wait(1000);

    cy.get('#e2e-idea-title-input input').type(newIdeaTitle);
    cy.get('#e2e-idea-description-input .ql-editor').type(newIdeaContent);

    cy.wait(1000);

    // verify the new values
    cy.get('@titleInput').should('exist');
    cy.get('@titleInput').should('contain.value', newIdeaTitle);
    cy.get('@descriptionInput').contains(newIdeaContent);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload');
    cy.get('#e2e-idea-file-upload');

    // add an image
    cy.get('#e2e-idea-image-upload input').attachFile('icon.png');
    // check that the base64 image was added to the dropzone component
    cy.get('#e2e-idea-image-upload input').should('have.length', 0);

    // Go to the page with topics
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 0);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type(
      'Boulevard Anspach Brussels'
    );
    cy.wait(10000);
    cy.get('.e2e-idea-form-location-input-field input').type('{enter}');

    // save the form
    cy.get('[data-cy="e2e-submit-form"]').click();

    cy.get('#e2e-accept-disclaimer').click();

    cy.get('[data-cy="e2e-after-submission"]').should('exist');
    cy.get('[data-cy="e2e-after-submission"]').click();

    // verify updated idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaSlug}`);

    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-show #e2e-idea-title').contains(newIdeaTitle);
    cy.get('#e2e-idea-show #e2e-idea-description').contains(newIdeaContent);
    cy.get('#e2e-idea-show').should('exist');
    cy.get('#e2e-idea-topics').should('exist');
    cy.get('.e2e-idea-topic').should('exist');
    cy.get('.e2e-idea-topic').should('have.length', 1);
    cy.get('#e2e-idea-show').contains('Boulevard Anspach');
    cy.get('#e2e-idea-show .e2e-author-link .e2e-username').contains(
      `${firstName} ${lastName}`
    );
  });

  it('has a working idea edit form for author field', () => {
    cy.setAdminLoginCookie();
    // Visit idea edit page as Admin
    cy.visit(`/ideas/edit/${ideaId}`);
    // Search and select an author
    cy.get('[data-cy="e2e-user-select"]')
      .click()
      .type(`${lastName}, ${firstName} {enter}`);
    // Save
    cy.get('form').submit();
    // Reload idea edit page
    cy.visit(`/ideas/edit/${ideaId}`);
    // Check that author field has correct value
    cy.contains(`${lastName}, ${firstName}`).should('exist');
  });

  it('has a go close button that redirects the user to the edit page when clicked', () => {
    cy.setAdminLoginCookie();
    // Go to idea edit page
    cy.visit(`/ideas/edit/${ideaId}`);

    cy.get('[data-cy="e2e-leave-edit-idea-button"]').click();
    cy.get('[data-cy="e2e-confirm-leave-edit-idea-button"]').should('exist');
    cy.get('[data-cy="e2e-confirm-leave-edit-idea-button"]').click();

    // Check to see that the user is redirected to the idea page
    cy.location('pathname').should('eq', `/en/ideas/${ideaSlug}`);
  });
});
