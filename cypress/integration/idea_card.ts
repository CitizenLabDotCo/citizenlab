describe('Idea card component', () => {
  let adminJwt: string = null as any;

  before(() => {
    cy.apiLogin('admin@citizenlab.co', 'testtest').then((response) => adminJwt = response.body.jwt);
  });

  beforeEach(() => {
    cy.visit('/ideas');
  });

  it('increments and decrements the vote count accordingly when the up and downvote buttons are clicked', () => {
    const firstName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const lastName = Math.random().toString(36).substr(2, 12).toLowerCase();
    const email = `${Math.random().toString(36).substr(2, 12).toLowerCase()}@${Math.random().toString(36).substr(2, 12).toLowerCase()}.co`;
    const password = Math.random().toString(36).substr(2, 12).toLowerCase();
    const ideaTitle = Math.random().toString(36);
    const ideaContent = Math.random().toString(36);

    cy.getProjectBySlug(adminJwt, 'an-idea-bring-it-to-your-council').then((projectResponse) => {
      const projectId = projectResponse.body.data.id;
      cy.apiCreateIdea(adminJwt, projectId, ideaTitle, ideaContent);
      cy.apiSignup(firstName, lastName, email, password);
      cy.login(email, password);

      cy.visit('/ideas');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-upvote-button').as('upvoteBtn');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-downvote-button').as('downvoteBtn');

      // initial upvote value
      cy.get('@upvoteBtn').contains('1');

      // initial downvote
      cy.get('@downvoteBtn').contains('0');

      // click upvote
      cy.get('@upvoteBtn').click();
      cy.wait(500);
      cy.get('@upvoteBtn').contains('2');

      // click upvote
      cy.get('@upvoteBtn').click();
      cy.wait(500);
      cy.get('@upvoteBtn').contains('1');

      // click downvote
      cy.get('@downvoteBtn').click();
      cy.wait(500);
      cy.get('@downvoteBtn').contains('1');

      // click downvote
      cy.get('@downvoteBtn').click();
      cy.wait(500);
      cy.get('@downvoteBtn').contains('0');

      // click downvote, then upvote
      cy.get('@downvoteBtn').click();
      cy.wait(500);
      cy.get('@upvoteBtn').click();
      cy.wait(500);
      cy.get('@downvoteBtn').contains('0');
      cy.get('@upvoteBtn').contains('2');
    });
  });

  it('increases and decreases the comments count accordingly when a parent and child comment are added or removed', () => {
    const ideaTitle = Math.random().toString(36);
    const ideaContent = Math.random().toString(36);
    const commentContent = Math.random().toString(36);
    let ideaId: string = null as any;
    let parentCommentId: string = null as any;
    let childCommentId: string = null as any;

    cy.getProjectBySlug(adminJwt, 'an-idea-bring-it-to-your-council').then((projectResponse) => {
      const projectId = projectResponse.body.data.id;
      return cy.apiCreateIdea(adminJwt, projectId, ideaTitle, ideaContent);
    }).then((ideaResponse) => {
      ideaId = ideaResponse.body.data.id;

      // add parent comment
      return cy.apiAddComment(adminJwt, ideaId, commentContent);
    }).then((parentCommentResponse) => {
      parentCommentId = parentCommentResponse.body.data.id;
      cy.visit('/ideas');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-comment-count').as('commentCount');
      cy.get('@commentCount').contains('1');

      // add child comment
      return cy.apiAddComment(adminJwt, ideaId, commentContent, parentCommentId);
    }).then((childCommentResponse) => {
      childCommentId = childCommentResponse.body.data.id;
      cy.visit('/ideas');
      cy.get('@commentCount').contains('2');

      // remove child comment
      return cy.apiRemoveComment(adminJwt, childCommentId);
    }).then(() => {
      cy.visit('/ideas');
      cy.get('@commentCount').contains('1');

      // remove parent comment
      return cy.apiRemoveComment(adminJwt, parentCommentId);
    }).then(() => {
      cy.visit('/ideas');
      cy.get('@commentCount').contains('0');
    });
  });
});
