import moment = require('moment');
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
  let eventId: string;

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
      })
      .then(() => {
        cy.apiCreateEvent({
          projectId,
          title: 'New event',
          location: 'Some location with coordinates',
          includeLocation: true,
          description: 'This is some event',
          startDate: moment().subtract(1, 'day').toDate(),
          endDate: moment().add(1, 'day').toDate(),
        });
      })
      .then((event) => {
        eventId = event.body.data.id;
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

  // TODO: Re-enable attendance tests once smart group implemented

  // it('shows the events the user is attending', () => {
  //   cy.clearCookies();
  //   // Confirm that the user event tab is not visible to other users
  //   cy.visit(`/profile/${newUserName}-${newUserSurname}`);
  //   cy.get('#e2e-usersshowpage');
  //   cy.get('.e2e-events-nav').should('not.exist');

  //   // Log in as the user
  //   cy.setLoginCookie(newUserEmail, newUserPassword);

  //   // Go to event
  //   cy.visit(`/events/${eventId}`);

  //   // RSVP to event
  //   cy.get('#e2e-event-attendance-button').should('exist');
  //   cy.get('#e2e-event-attendance-button').click();

  //   // Go to profile
  //   cy.visit(`/profile/${newUserName}-${newUserSurname}`);
  //   cy.get('#e2e-usersshowpage');

  //   // Confirm the event is in the list
  //   cy.get('.e2e-events-nav').click();
  //   cy.get('.e2e-profile-events').should('exist');
  //   cy.get('#e2e-event-attendance-button').should('exist');
  // });

  after(() => {
    cy.apiRemoveComment(commentId);
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveUser(userId);
  });
});
