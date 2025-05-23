import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Idea internal comments', () => {
  let projectId: string;
  let ideaId1: string;
  let ideaId2: string;
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  const ideaTitle1 = randomString();
  const ideaContent1 = randomString();
  const ideaTitle2 = randomString();
  const ideaContent2 = randomString();
  let phaseId: string;

  before(() => {
    cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
      const adminJwt = response.body.jwt;
      cy.request({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminJwt}`,
        },
        method: 'PATCH',
        url: `web_api/v1/app_configuration`,
        body: {
          settings: {
            internal_commenting: {
              enabled: true,
              allowed: true,
            },
          },
        },
      });
    });

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      })
      .then(() => {
        return cy.apiCreateIdea({
          projectId,
          ideaTitle: ideaTitle1,
          ideaContent: ideaContent1,
          phaseIds: [phaseId],
        });
      })
      .then((idea1) => {
        ideaId1 = idea1.body.data.id;
        return cy.apiCreateIdea({
          projectId,
          ideaTitle: ideaTitle2,
          ideaContent: ideaContent2,
          phaseIds: [phaseId],
        });
      })
      .then((idea2) => {
        ideaId2 = idea2.body.data.id;
      });
  });

  it('allows users to post, edit and delete an internal comment', () => {
    const internalComment = randomString();
    const editedComment = randomString();
    cy.setAdminLoginCookie();
    cy.visit(`admin/projects/${projectId}/ideas/${ideaId1}`);
    cy.acceptCookies();
    // Create comment and check that comment is created
    cy.dataCy('e2e-comments-tab-internal').click();
    cy.get('#submit-comment').should('exist');
    cy.get('#submit-comment').click().type(internalComment);
    cy.get('.e2e-submit-parentcomment').click();
    cy.get('.e2e-parentcomment').contains(internalComment);

    // Edit comment and check that comment is edited
    cy.dataCy('e2e-internal-comments-more-actions').first().should('exist');
    cy.dataCy('e2e-internal-comments-more-actions').first().click();
    cy.get('.e2e-more-actions-list button').eq(1).contains('Edit');
    cy.get('.e2e-more-actions-list button').eq(1).click();
    cy.get('#e2e-internal-comment-edit-textarea')
      .click()
      .clear()
      .type(editedComment);
    cy.get('#e2e-save-internal-comment-edit-button').click();
    cy.get('.e2e-parentcomment').contains(editedComment);

    // Delete comment and check that comment is deleted
    cy.dataCy('e2e-internal-comments-more-actions').first().should('exist');
    cy.dataCy('e2e-internal-comments-more-actions').first().click();
    cy.get('.e2e-more-actions-list button').eq(0).contains('Delete');
    cy.get('.e2e-more-actions-list button').eq(0).click();
    cy.get('#e2e-confirm-internal-comment-deletion').should('exist');
    cy.get('#e2e-confirm-internal-comment-deletion').click();
    cy.get('.e2e-parentcomment').should('not.exist');
  });

  it('allows users to reply to internal comments, edit and delete a reply', () => {
    const internalComment = randomString();
    const replyComment = randomString();
    const editedReply = randomString();
    cy.setAdminLoginCookie();
    cy.visit(`admin/projects/${projectId}/ideas/${ideaId2}`);
    cy.acceptCookies();
    // Create comment and check that comment is created
    cy.dataCy('e2e-comments-tab-internal').click();
    cy.get('#submit-comment').should('exist');
    cy.get('#submit-comment').click().type(internalComment);
    cy.get('.e2e-submit-parentcomment').click();
    cy.get('.e2e-parentcomment').contains(internalComment);

    // Reply to comment and check that reply is created
    cy.get('.e2e-comment-reply-button').should('exist');
    cy.get('.e2e-comment-reply-button').click();
    cy.get('#e2e-internal-child-comment-text-area').should('exist');
    cy.get('#e2e-internal-child-comment-text-area').click().type(replyComment);
    cy.get('.e2e-submit-childcomment').first().click();
    cy.get('.e2e-internal-child-comment').contains(replyComment);

    // Edit reply and check that reply is edited
    cy.dataCy('e2e-internal-comments-more-actions').eq(1).should('exist');
    cy.dataCy('e2e-internal-comments-more-actions').eq(1).click();
    cy.get('.e2e-more-actions-list button').eq(1).contains('Edit');
    cy.get('.e2e-more-actions-list button').eq(1).click();
    cy.get('#e2e-internal-comment-edit-textarea')
      .click()
      .clear()
      .type(editedReply);
    cy.get('#e2e-save-internal-comment-edit-button').click();
    cy.get('.e2e-internal-child-comment').contains(editedReply);

    // Delete reply and check that reply is deleted
    cy.dataCy('e2e-internal-comments-more-actions').eq(1).should('exist');
    cy.dataCy('e2e-internal-comments-more-actions').eq(1).click();
    cy.get('.e2e-more-actions-list button').eq(0).contains('Delete');
    cy.get('.e2e-more-actions-list button').eq(0).click();
    cy.get('#e2e-confirm-internal-comment-deletion').should('exist');
    cy.get('#e2e-confirm-internal-comment-deletion').click();
    cy.get('.e2e-internal-child-comment').contains(
      'This comment has been deleted.'
    );
  });

  after(() => {
    cy.apiRemoveIdea(ideaId1);
    cy.apiRemoveProject(projectId);
  });
});
