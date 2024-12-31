import { randomString, randomEmail } from '../support/commands';
import moment = require('moment');

describe('Idea card component', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  const commentContent = randomString();
  let projectId: string;
  let projectSlug: string;
  let ideaId: string;
  let userId: string;

  before(() => {
    cy.apiCreateProject({
      title: randomString(20),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        return cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
          reacting_dislike_enabled: true,
        });
      })
      .then(() => {
        return cy.apiSignup(firstName, lastName, email, password);
      })
      .then((user) => {
        userId = user.body.data.id;
        return cy.apiCreateIdea({
          projectId,
          ideaTitle,
          ideaContent,
        });
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
        return cy.apiAddComment(ideaId, commentContent);
      })
      .then((parentComment) => {
        return cy.apiAddComment(
          ideaId,
          commentContent,
          parentComment.body.data.id
        );
      })
      .then(() => {
        cy.wait(500);
      });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);

    // visit ideas page and sort idea cards by newest first
    cy.visit(`/projects/${projectSlug}`);

    cy.wait(2000);
    cy.get('#e2e-ideas-list');

    // sort ideas by newest first
    cy.get('#e2e-item-new').click();

    cy.wait(2000);
    cy.get('#e2e-ideas-list');
  });

  it('increments and decrements the reaction count accordingly when the up and dislike buttons are clicked', () => {
    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .contains(ideaTitle)
      .closest('.e2e-idea-card')
      .find('.e2e-ideacard-like-button')
      .as('likeBtn');
    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .contains(ideaTitle)
      .closest('.e2e-idea-card')
      .find('.e2e-ideacard-dislike-button')
      .as('dislikeBtn');

    // check initial likes & dislikes
    cy.get('@likeBtn').contains('1');
    cy.get('@dislikeBtn').contains('0');

    // add like
    cy.wait(500);
    cy.get('@likeBtn').click();
    cy.wait(1000);
    cy.get('@likeBtn').contains('2');

    // remove like
    cy.wait(500);
    cy.get('@likeBtn').click();
    cy.wait(1000);
    cy.get('@likeBtn').contains('1');

    // add dislike
    cy.wait(500);
    cy.get('@dislikeBtn').click();
    cy.wait(1000);
    cy.get('@dislikeBtn').contains('1');

    // remove dislike
    cy.wait(500);
    cy.get('@dislikeBtn').click();
    cy.wait(1000);
    cy.get('@dislikeBtn').contains('0');

    // add dislike, then like
    cy.get('@dislikeBtn').wait(500).click().wait(1000);
    cy.get('@likeBtn').wait(500).click().wait(1000);
    cy.get('@dislikeBtn').contains('0');
    cy.get('@likeBtn').contains('2');
  });

  it('shows the correct comment count', () => {
    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .contains(ideaTitle)
      .closest('.e2e-idea-card')
      .find('.e2e-ideacard-comment-count')
      .contains('2');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });
});
