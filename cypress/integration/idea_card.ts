import { randomString, randomEmail } from '../support/commands';

describe('Idea card component', () => {

  const prepareIdeaPage = (ideaTitle: string) => {
    // visit ideas page and sort idea cards by newest first
    cy.visit('/ideas');
    cy.wait(1000);

    // sort ideas by newest first
    cy.get('#e2e-ideas-list');
    cy.get('#e2e-ideas-sort-filter').click();
    cy.get('.e2e-filter-selector-dropdown-list').find('.e2e-projects-filter-new').click();

    cy.wait(1000);
    cy.get('#e2e-ideas-list');

    cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-upvote-button').as('upvoteBtn');
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-downvote-button').as('downvoteBtn');
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-comment-count').as('commentCount');
  };

  describe('Vote count', () => {
    const ideaTitle = randomString();

    before(() => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = randomString();
      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();
      const ideaContent = randomString();

      cy.apiCreateProject('continuous', projectTitle, projectDescriptionPreview, projectDescription).then((project) => {
        const projectId = project.body.data.id;
        cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
        cy.apiSignup(firstName, lastName, email, password);
        cy.login(email, password);
        prepareIdeaPage(ideaTitle);
      });
    });

    it('increments and decrements the vote count accordingly when the up and downvote buttons are clicked', () => {
      // check initial upvotes & downvotes
      cy.get('@upvoteBtn').contains('1');
      cy.get('@downvoteBtn').contains('0');

      // add upvote
      cy.get('@upvoteBtn').wait(500).click().wait(1000).contains('2');

      // remove upvote
      cy.get('@upvoteBtn').wait(500).click().wait(1000).contains('1');

      // add downvote
      cy.get('@downvoteBtn').wait(500).click().wait(1000).contains('1');

      // remove downvote
      cy.get('@downvoteBtn').wait(500).click().wait(1000).contains('0');

      // add downvote, then upvote
      cy.get('@downvoteBtn').wait(500).click().wait(1000);
      cy.get('@upvoteBtn').wait(500).click().wait(1000);
      cy.get('@downvoteBtn').contains('0');
      cy.get('@upvoteBtn').contains('2');
    });
  });

  describe('Comment count', () => {
    const ideaTitle = randomString();
    const ideaContent = Math.random().toString(36);
    const commentContent = randomString();
    let ideaId: string = null as any;
    let parentCommentId: string = null as any;
    let childCommentId: string = null as any;

    before(() => {
      cy.getProjectBySlug('an-idea-bring-it-to-your-council').then((project) => {
        const projectId = project.body.data.id;
        return cy.apiCreateIdea(projectId, ideaTitle, ideaContent);
      }).then((idea) => {
        ideaId = idea.body.data.id;
        // add parent comment
        return cy.apiAddComment(ideaId, commentContent);
      }).then((parentComment) => {
        parentCommentId = parentComment.body.data.id;
        prepareIdeaPage(ideaTitle);
      });
    });

    it('increases and decreases the comments count accordingly when a parent and child comment are added or removed', () => {
      // check comment count
      cy.get('@commentCount').contains('1');

        // add child comment
      cy.apiAddComment(ideaId, commentContent, parentCommentId).then((childComment) => {
        childCommentId = childComment.body.data.id;

        // reload idea page
        prepareIdeaPage(ideaTitle);

        // check comment count
        cy.get('@commentCount').contains('2');

        // remove child comment
        return cy.apiRemoveComment(childCommentId);
      }).then(() => {
        // reload idea page
        prepareIdeaPage(ideaTitle);

        // check comment count
        cy.get('@commentCount').contains('1');

        // remove parent comment
        cy.apiRemoveComment(parentCommentId);

        // reload idea page
        prepareIdeaPage(ideaTitle);

        // check comment count
        cy.get('@commentCount').contains('0');
      });
    });
  });
});
