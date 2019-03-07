describe('Idea card component', () => {
  let adminJwt: string = null as any;

  const getProjectBySlug = (projectSlug: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'GET',
      url: `web_api/v1/projects/by_slug/${projectSlug}`
    });
  };

  const apiCreateIdea = (projectId: string, ideaTitle: string, ideaContent: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: 'web_api/v1/ideas',
      body: {
        idea: {
          project_id: projectId,
          publication_status: 'published',
          title_multiloc: {
            'en-GB': ideaTitle,
            'nl-BE': ideaTitle
          },
          body_multiloc: {
            'en-GB': ideaContent,
            'nl-BE': ideaContent
          }
        }
      }
    });
  };

  const apiAddComment = (ideaId: string, commentContent: string, commentParentId?: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: `web_api/v1/ideas/${ideaId}/comments`,
      body: {
        comment: {
          body_multiloc: {
            'en-GB': commentContent,
            'nl-BE': commentContent
          },
          parent_id: commentParentId
        }
      }
    });
  };

  const apiRemoveComment = (commentId: string) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`
      },
      method: 'POST',
      url: `web_api/v1/comments/${commentId}/mark_as_deleted`,
    });
  };

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

    cy.apiSignup(firstName, lastName, email, password);
    cy.login(email, password);

    getProjectBySlug('an-idea-bring-it-to-your-council').then((projectResponse) => {
      const projectId = projectResponse.body.data.id;
      return apiCreateIdea(projectId, ideaTitle, ideaContent);
    }).then(() => {
      cy.visit('/ideas');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-upvote-button').as('upvoteBtn');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-downvote-button').as('downvoteBtn');
      cy.get('@upvoteBtn')
        .contains('1')
        .click()
        .wait(500)
        .contains('2')
        .click()
        .wait(500)
        .contains('1');
      cy.get('@downvoteBtn')
        .contains('0')
        .click()
        .wait(500)
        .contains('1')
        .click()
        .wait(500)
        .contains('0')
        .click()
        .wait(500);
      cy.get('@upvoteBtn').click().wait(500);
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

    getProjectBySlug('an-idea-bring-it-to-your-council').then((projectResponse) => {
      const projectId = projectResponse.body.data.id;
      return apiCreateIdea(projectId, ideaTitle, ideaContent);
    }).then((ideaResponse) => {
      ideaId = ideaResponse.body.data.id;
      return apiAddComment(ideaId, commentContent);
    }).then((parentCommentResponse) => {
      parentCommentId = parentCommentResponse.body.data.id;
      cy.visit('/ideas');
      cy.get('#e2e-ideas-container').find('.e2e-idea-card').contains(ideaTitle).closest('.e2e-idea-card').find('.e2e-ideacard-comment-count').as('commentCount');
      cy.get('@commentCount').contains('1');
      return apiAddComment(ideaId, commentContent, parentCommentId);
    }).then((childCommentResponse) => {
      childCommentId = childCommentResponse.body.data.id;
      cy.visit('/ideas');
      cy.get('@commentCount').contains('2');
      return apiRemoveComment(childCommentId);
    }).then(() => {
      cy.visit('/ideas');
      cy.get('@commentCount').contains('1');
      return apiRemoveComment(parentCommentId);
    }).then(() => {
      cy.visit('/ideas');
      cy.get('@commentCount').contains('0');
    });
  });
});
