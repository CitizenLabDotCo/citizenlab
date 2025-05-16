import { randomString, randomEmail } from '../support/commands';
import moment = require('moment');

describe('Proposal edit page', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  const inputOldTitle = randomString(40);
  const inputOldContent = randomString(60);
  const inputNewTitle = randomString(40);
  const inputNewContent = randomString(60);
  let projectId: string;
  let inputId: string;
  let inputSlug: string;

  beforeEach(() => {
    cy.setAdminLoginCookie();

    // Create proposals project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      // projectSlug = project.body.data.attributes.slug;
      return cy.apiCreatePhase({
        projectId: projectId,
        title: 'Proposals',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        participationMethod: 'proposals',
        canPost: true,
        canComment: true,
        canReact: true,
      });
    });

    // Create a proposal with location
    cy.apiCreateIdea({
      projectId,
      ideaTitle: inputOldTitle,
      ideaContent: inputOldContent,
    }).then((idea) => {
      inputId = idea.body.data.id;
      inputSlug = idea.body.data.attributes.slug;
    });
  });

  afterEach(() => {
    if (inputId) {
      cy.apiRemoveIdea(inputId);
    }
  });

  it('edit a proposal after form changes while adding an image and cosponsors', () => {
    // cy.setLoginCookie(email, password);
    cy.intercept('GET', `**/ideas/${inputSlug}**`).as('idea');

    // check original values
    cy.visit(`/ideas/${inputSlug}`);

    cy.get('#e2e-idea-show');
    cy.get('#e2e-idea-title').should('exist').contains(inputOldTitle);
    cy.get('#e2e-idea-description').should('exist').contains(inputOldContent);

    // go to form
    cy.visit(`/ideas/edit/${inputId}`);
    cy.acceptCookies();

    cy.wait('@idea');

    cy.get('#e2e-idea-edit-page');
    cy.get('#idea-form').should('exist');
    cy.get('#e2e-idea-title-input input').as('titleInput');

    // check initial form values
    cy.get('@titleInput').should('exist');
    cy.get('@titleInput').should(($input) => {
      expect($input.val()).to.eq(inputOldTitle);
    });

    // So typing the title doesn't get interrupted
    cy.wait(1000);

    // Edit title and description
    cy.get('@titleInput')
      .clear()
      .should('exist')
      .should('not.be.disabled')
      .type(inputNewTitle);

    // verify the new values
    cy.get('@titleInput').should('exist');
    cy.get('@titleInput').should('contain.value', inputNewTitle);

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
  });
});
