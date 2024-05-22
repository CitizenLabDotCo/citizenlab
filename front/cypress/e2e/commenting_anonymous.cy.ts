import { randomEmail, randomString } from '../support/commands';
import moment = require('moment');

describe('Idea with anonymous commenting allowed', () => {
  const projectTitle = randomString();
  const phaseTitle = randomString();
  const ideaTitle = randomString(20);
  const ideaContent = randomString(60);
  const email = randomEmail();
  const password = randomString(15);
  let projectId: string;
  let projectSlug: string;
  let ideaId: string;
  let ideaSlug: string;
  let userId: string;

  before(() => {
    cy.apiSignup('firstName', 'lastName', email, password).then((response) => {
      userId = response.body.data.id;
    });
    cy.setAdminLoginCookie();
    cy.getAuthUser().then(() => {
      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: '',
        description: '',
        publicationStatus: 'published',
      })
        .then((project) => {
          projectId = project.body.data.id;
          projectSlug = project.body.data.attributes.slug;
          return cy.apiCreatePhase({
            projectId,
            title: phaseTitle,
            startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
            participationMethod: 'ideation',
            canPost: true,
            canComment: true,
            canReact: true,
            allow_anonymous_participation: true,
          });
        })
        .then((phase) => {
          return cy
            .apiCreateIdea({
              projectId,
              ideaTitle,
              ideaContent,
              phaseIds: [phase.body.data.id],
            })
            .then((idea) => {
              ideaId = idea.body.data.id;
              ideaSlug = idea.body.data.attributes.slug;
            });
        });
    });
  });

  it('admin can submit anonymous comments', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/ideas/${ideaSlug}`);
    cy.get('#submit-comment').should('exist');
    cy.get('#submit-comment').click().type('Anonymous comment body');
    cy.get('[data-testid="e2e-post-comment-anonymously-checkbox"]').should(
      'exist'
    );
    cy.get('[data-testid="e2e-post-comment-anonymously-checkbox"]').click();
    cy.get('.e2e-submit-parentcomment').click();

    // confirm anonymous participation
    cy.get('#e2e-continue-anonymous-participation-btn').should('exist');
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    cy.get('#e2e-anonymous-username').should('exist');
  });

  it('resident can submit anonymous comments', () => {
    cy.setLoginCookie(email, password);
    cy.visit(`/ideas/${ideaSlug}`);
    cy.get('#submit-comment').should('exist');
    cy.get('#submit-comment').click().type('Anonymous comment body');
    cy.get('[data-testid="e2e-post-comment-anonymously-checkbox"]').should(
      'exist'
    );
    cy.get('[data-testid="e2e-post-comment-anonymously-checkbox"]').click();
    cy.get('.e2e-submit-parentcomment').click();

    // confirm anonymous participation
    cy.get('#e2e-continue-anonymous-participation-btn').should('exist');
    cy.get('#e2e-continue-anonymous-participation-btn').click();

    cy.get('#e2e-anonymous-username').should('exist');
  });

  after(() => {
    cy.apiRemoveUser(userId);
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
  });
});
