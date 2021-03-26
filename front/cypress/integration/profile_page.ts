import { randomString, randomEmail } from '../support/commands';

describe('Profile Page', () => {
  const newUserName = randomString();
  const newUserSurname = randomString();
  const newUserEmail = randomEmail();
  const newUserPassword = randomString();
  const ideaTitle = randomString();
  const ideaContent = randomString();
  const commentContent = randomString();
  let jwt: string;
  let projectId: string;
  let ideaId: string;
  let commentId: string;
  let userId: string;

  before(() => {
    cy.apiSignup(
      newUserName,
      newUserSurname,
      newUserEmail,
      newUserPassword
    ).then((userResponse) => {
      userId = userResponse.body.data.id;
    });
    cy.apiLogin(newUserEmail, newUserPassword)
      .then((user) => {
        jwt = user.body.jwt;
        return cy.getProjectBySlug('an-idea-bring-it-to-your-council');
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreateIdea(
          projectId,
          ideaTitle,
          ideaContent,
          undefined,
          undefined,
          jwt
        );
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
        return cy.apiAddComment(ideaId, 'idea', commentContent, undefined, jwt);
      })
      .then((comment) => {
        commentId = comment.body.data.id;
      });
  });

  beforeEach(() => {
    cy.visit(`/profile/${newUserName}-${newUserSurname}`);
    cy.get('#e2e-usersshowpage');
    cy.wait(1000);
  });

  it('shows the page, and main infos', () => {
    cy.get('#e2e-usersshowpage-fullname').contains(
      `${newUserName} ${newUserSurname}`
    );
  });

  it('shows the ideas the user posted', () => {
    cy.get('.e2e-search-input input').type(ideaTitle);
    cy.get('.e2e-search-input input').should('have.value', ideaTitle);
    cy.get('#e2e-ideas-container')
      .find('.e2e-idea-card')
      .should('have.length', 1)
      .contains(ideaTitle);
  });

  it('shows the comments the user posted', () => {
    cy.get('.e2e-comment-section-nav').click();
    cy.get('.e2e-profile-comments');
    cy.get('.e2e-profile-comments').contains(commentContent);
  });

  after(() => {
    cy.apiRemoveComment(commentId);
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveUser(userId);
  });
});
