import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

describe('Proposal show page actions', () => {
  let projectId = '';
  let projectSlug = '';
  let proposalId = '';
  let proposalSlug = '';
  const phaseTitle = randomString();

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
          title: phaseTitle,
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'proposals',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        cy.apiCreateIdea({
          projectId,
          ideaTitle: randomString(20),
          ideaContent: randomString(),
          phaseIds: [phase.body.data.id],
        }).then((proposal) => {
          proposalId = proposal.body.data.id;
          proposalSlug = proposal.body.data.attributes.slug;
        });
      });
  });

  after(() => {
    cy.apiRemoveIdea(proposalId);
    cy.apiRemoveProject(projectId);
  });

  describe('not logged in', () => {
    before(() => {
      cy.intercept('**/idea_statuses/**').as('ideaStatuses');

      cy.visit(`/ideas/${proposalSlug}`);
      cy.get('#e2e-idea-show');

      // We wait for this request so that we know the idea page is more or less
      // done loading. Should not be necessary but reduces flakiness.
      cy.wait('@ideaStatuses');
    });

    it('asks unauthorised users to log in or sign up before they reaction', () => {
      cy.get('.e2e-reaction-controls .e2e-ideacard-vote-button').click({
        force: true,
      });
      cy.get('#e2e-authentication-modal');
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
        cy.visit(`/ideas/${proposalSlug}`);
        cy.intercept(`**/ideas/by_slug/${proposalSlug}`).as('ideaRequest');

        cy.wait('@ideaRequest');
        cy.get('#e2e-idea-show').should('exist');
        cy.get('.e2e-ideacard-vote-button').should('exist');

        // Vote
        cy.get('.e2e-ideacard-vote-button').should('contain.text', 'Vote');
        cy.get('.e2e-ideacard-vote-button').click().wait(1000);
        cy.get('.e2e-ideacard-vote-button').should('contain.text', 'Voted');

        // Cancel vote

        cy.get('.e2e-ideacard-vote-button').click().wait(1000);
        cy.get('.e2e-ideacard-vote-button').should('contain.text', 'Vote');
      });
    });
  });
});
