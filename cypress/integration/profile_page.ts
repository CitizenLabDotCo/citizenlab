import { randomString, randomEmail } from '../support/commands';
const salt = randomString(7);

const newUserName = `name${salt}`;
const newUserSurname = `surname${salt}`;
const newUserEmail = randomEmail();
const newUserPassword = salt;
let jwt: string;

describe('Profile Page', () => {
  before(() => {
    cy.apiSignup(newUserName, newUserSurname, newUserEmail, newUserPassword);
    cy.apiLogin(newUserEmail, newUserPassword).then((response) => {
      jwt = response.body.jwt;
    });
  });
  it('shows the page, and main infos', () => {
    cy.visit('/profile/sylvester-kalinoski');
    cy.get('#e2e-usersshowpage');
    cy.get('#e2e-usersshowpage-fullname').contains('Sylvester Kalinoski');
  });
  it('shows the ideas the user posted', () => {
    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      const projectId  = project.body.data.id;
      const ideaTitle = randomString();
      const ideaContent = randomString();

      cy.apiCreateIdea(projectId, ideaTitle, ideaContent, jwt);

      cy.visit(`/profile/${newUserName}-${newUserSurname}`);

      // type ideaTitle in search field and check if it's actually there
      cy.get('#e2e-ideas-search').type(ideaTitle).should('have.value', ideaTitle);

      // there should only be this idea (ideaTitle), which we double check (length + content)
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').should('have.length', 1).contains(ideaTitle);
    });
  });
  it('shows the comments the user posted', () => {
    let ideaId: string;
    const commentContent = randomString();
    cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
      const projectId = project.body.data.id;
      const ideaTitle = randomString();
      const ideaContent = randomString();
      return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
    }).then((idea) => {
      ideaId = idea.body.data.id;

      // add comment
      cy.apiAddComment(ideaId, commentContent, undefined, jwt).then(() => {

        cy.visit(`/profile/${newUserName}-${newUserSurname}`);

        cy.get('.e2e-comment-section-nav').click();

        cy.get('.e2e-profile-comments').contains(commentContent);
      });
    });
  });
});
