import { randomString, randomEmail } from '../support/commands';

describe('Idea show page actions', () => {
  let projectId = '';
  let projectSlug = '';
  let ideaId = '';
  let ideaSlug = '';

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: randomString(20),
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
      participationMethod: 'ideation',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      cy.apiCreateIdea(projectId, randomString(20), randomString()).then(
        (idea) => {
          ideaId = idea.body.data.id;
          ideaSlug = idea.body.data.attributes.slug;
        }
      );
    });
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
  });

  describe('not logged in', () => {
    before(() => {
      cy.visit(`/ideas/${ideaSlug}`);
      cy.get('#e2e-idea-show');
      cy.acceptCookies();
    });

    it('asks unauthorised users to log in or sign up before they reaction', () => {
      cy.get('.e2e-reaction-controls .e2e-ideacard-like-button').click();
      cy.get('#e2e-authentication-modal');
    });
  });

  describe('logged in as admin', () => {
    beforeEach(() => {
      cy.setAdminLoginCookie();
      cy.reload();
    });

    before(() => {
      cy.visit(`/ideas/${ideaSlug}`);
      cy.get('#e2e-idea-show');
      cy.acceptCookies();
    });

    it('saves a new official feedback, shows it and deletes it', () => {
      const officialFeedbackBody = randomString(30);
      const officialFeedbackAuthor = randomString();

      cy.get('.e2e-localeswitcher').each((button) => {
        // input
        cy.wrap(button).click();
        cy.get('#official-feedback-form textarea').type(officialFeedbackBody);
        cy.get('#official-feedback-form input').type(officialFeedbackAuthor);
      });

      // save
      cy.get('.e2e-official-feedback-form-submit-button').click();
      cy.wait(2000);
      cy.get('.e2e-official-feedback-post-body').contains(officialFeedbackBody);
      cy.get('.e2e-official-feedback-post-author').contains(
        officialFeedbackAuthor
      );
    });

    describe('Map idea card', () => {
      it('displays correct likes and dislikes on map idea card', () => {
        cy.visit(`/projects/${projectSlug}`);
        cy.get('#view-tab-2').should('exist');
        cy.get('#view-tab-2').click();
        cy.get('#e2e-idea-map-card')
          .first()
          .within(() => {
            cy.get('#e2e-map-card-like-count').should('contain', '1');
            cy.get('#e2e-map-card-dislike-count').should('contain', '0');
          });
      });
    });
  });

  describe('logged in as normal user', () => {
    describe('Reaction', () => {
      beforeEach(() => {
        const firstName = randomString();
        const lastName = randomString();
        const email = randomEmail();
        const password = randomString();

        cy.apiSignup(firstName, lastName, email, password);
        cy.setLoginCookie(email, password);
        cy.reload();
      });

      it('has working up and dislike buttons', () => {
        cy.visit(`/ideas/${ideaSlug}`);
        cy.intercept(`**/ideas/by_slug/${ideaSlug}`).as('ideaRequest');

        cy.wait('@ideaRequest');
        cy.get('#e2e-idea-show').should('exist');

        cy.get('.e2e-reaction-controls').should('exist');
        cy.get('.e2e-ideacard-like-button').should('exist');
        cy.get('.e2e-ideacard-dislike-button').should('exist');

        cy.get('.e2e-reaction-controls')
          .find('.e2e-ideacard-like-button')
          .as('likeBtn');
        cy.get('.e2e-reaction-controls')
          .find('.e2e-ideacard-dislike-button')
          .as('dislikeBtn');

        // initial like & dislike values
        cy.get('@likeBtn').contains('1');
        cy.get('@dislikeBtn').contains('0');

        // add like
        cy.get('@likeBtn').click().wait(1000).contains('2');

        // remove like
        cy.get('@likeBtn').click().wait(1000).contains('1');

        // add dislike
        cy.get('@dislikeBtn').click().wait(1000).contains('1');

        // remove dislike
        cy.get('@dislikeBtn').click().wait(1000).contains('0');

        // add dislike, then like
        cy.get('@dislikeBtn').click().wait(1000);
        cy.get('@likeBtn').click().wait(1000);
        cy.get('@dislikeBtn').contains('0');
        cy.get('@likeBtn').contains('2');
        cy.get('@likeBtn').click().wait(1000);
      });
    });

    describe('Comments', () => {
      const email = randomEmail();
      const password = randomString();

      let ideaId2 = '';
      let ideaSlug2 = '';

      before(() => {
        const firstName = randomString();
        const lastName = randomString();
        cy.apiSignup(firstName, lastName, email, password);

        cy.apiCreateIdea(projectId, randomString(20), randomString()).then(
          (idea) => {
            ideaId2 = idea.body.data.id;
            ideaSlug2 = idea.body.data.attributes.slug;

            cy.apiAddComment(ideaId2, 'idea', randomString());
          }
        );
      });

      beforeEach(() => {
        cy.setLoginCookie(email, password);
        cy.reload();
        cy.visit(`/ideas/${ideaSlug2}`);
        cy.acceptCookies();
        cy.get('#e2e-idea-show');
      });

      it('shows a working comment input', () => {
        const commentBody = randomString();
        cy.get('#submit-comment')
          .type(commentBody)
          .should('have.value', commentBody);
      });

      describe('Comment', () => {
        it('lets a logged in user reply to a parent comment', () => {
          const commentBody = randomString();
          cy.get('.e2e-comment-reply-button').first().click({ force: true });
          cy.wait(1000);
          cy.get('.e2e-childcomment-form textarea').first().type(commentBody);
          cy.get('.e2e-submit-childcomment').first().click();
          cy.wait(2000);
          cy.get('.e2e-parent-and-childcomments')
            .get('.e2e-childcomment')
            .last()
            .contains(commentBody);
        });
      });
    });
  });
});
