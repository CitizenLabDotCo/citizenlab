import moment = require('moment');
import { randomEmail, randomString } from '../support/commands';

describe('Project with single voting phase', () => {
  let projectId: string;
  let projectSlug: string;
  let ideaId: string;
  let ideaSlug: string;
  let userId: string;
  const projectTitle = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
    }).then((project) => {
      cy.apiCreatePhase({
        projectId: project?.body.data.id,
        title: 'phaseTitle',
        startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
        endAt: moment().add(2, 'days').format('DD/MM/YYYY'),
        participationMethod: 'voting',
        votingMethod: 'single_voting',
        votingMaxTotal: 5,
        votingMinTotal: 1,
      }).then((phase) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
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
            cy.apiSignup(firstName, lastName, email, password).then(
              (response) => {
                userId = (response as any).body.data.id;
              }
            );
            cy.visit(`/en/projects/${projectSlug}`);
            cy.setLoginCookie(email, password);

            cy.wait(1000);
          });
      });
    });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit(`/en/projects/${projectSlug}`);
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  it('shows/hides things correctly', () => {
    // it shows the idea cards
    cy.get('#e2e-ideas-list').should('be.visible');
    // it hides the idea sorting options
    cy.get('.e2e-filter-selector-button').should('not.exist');
  });

  it('can allocate votes to ideas and show how many votes are left', () => {
    cy.contains('Cast your vote');
    cy.contains('How to vote');
    cy.dataCy('project-cta-bar-top').contains('5 out of 5 votes left');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('have.class', 'disabled');

    cy.get('#e2e-ideas-container')
      .find('.e2e-single-vote-button button')
      .should('have.class', 'primary-outlined')
      .click()
      .should('have.class', 'primary');
    cy.wait(1000);

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('not.have.class', 'disabled');

    cy.dataCy('project-cta-bar-top').contains('4 out of 5 votes left');
  });

  it('can submit the votes', () => {
    cy.intercept(`**/baskets/**`).as('basketRequest');
    cy.visit(`/en/projects/${projectSlug}`);
    cy.wait('@basketRequest');
    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('not.have.class', 'disabled');
    cy.wait(4000);
    cy.get('#e2e-voting-submit-button').find('button').click({ force: true });

    cy.contains('Vote submitted');
    cy.contains('Congratulations, your vote has been submitted');

    cy.get('#e2e-ideas-container')
      .find('.e2e-single-vote-button button')
      .should('have.class', 'disabled');
  });

  it('can modify and remove the votes', () => {
    cy.get('#e2e-modify-votes')
      .should('be.visible')
      .should('contain', 'Modify your submission')
      .click();
    cy.wait(1000);

    cy.get('.e2e-single-vote-button button')
      .should('be.visible')
      .should('have.class', 'primary')
      .click()
      .should('have.class', 'primary-outlined');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('have.class', 'disabled');
  });

  // TODO: Check you cannot add more than the maximum?
});
