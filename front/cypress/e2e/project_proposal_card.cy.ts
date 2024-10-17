import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('Proposal card component', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  const commentContent = randomString();

  let ideaId: string;
  let userId: string;
  let parentCommentId: string;
  let childCommentId: string;
  let projectTitle = randomString();
  let projectDescriptionPreview = randomString();
  let projectDescription = randomString();
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.setAdminLoginCookie();

    // Create active project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
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

    cy.logout();

    cy.apiSignup(firstName, lastName, email, password)
      .then((user) => {
        userId = user.body.data.id;
        return cy.getProjectBySlug(projectSlug);
      })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreateIdea({
          projectId: project?.body.data.id,
          ideaTitle,
          ideaContent,
        });
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
        return cy.apiAddComment(ideaId, commentContent);
      })
      .then((parentComment) => {
        parentCommentId = parentComment.body.data.id;
        return cy.apiAddComment(ideaId, commentContent, parentCommentId);
      })
      .then((childComment) => {
        childCommentId = childComment.body.data.id;
        cy.wait(500);
      });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit(`/projects/${projectSlug}`);
  });

  it('shows the correct votes count', () => {
    cy.intercept('GET', `**/${projectSlug}`).as('getProject');
    cy.wait('@getProject');

    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .contains(ideaTitle)
      .closest('.e2e-idea-card')
      .should('contain.text', '1 / 300');
  });

  it('shows the correct status', () => {
    cy.intercept('GET', `**/${projectSlug}`).as('getProject');
    cy.wait('@getProject');

    cy.get('#e2e-ideas-list')
      .find('.e2e-idea-card')
      .contains(ideaTitle)
      .closest('.e2e-idea-card')
      .should('contain.text', 'proposed');
  });

  it('shows the correct comment count', () => {
    cy.intercept('GET', `**/${projectSlug}`).as('getProject');
    cy.wait('@getProject');

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
