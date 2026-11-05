import moment = require('moment');
import { randomEmail, randomString } from '../support/commands';

describe('Multiple voting project', () => {
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
      publicationStatus: 'published',
    }).then((project) => {
      cy.apiCreatePhase({
        projectId: project?.body.data.id,
        title: 'phaseTitle',
        startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
        endAt: moment().add(2, 'days').format('DD/MM/YYYY'),
        participationMethod: 'voting',
        votingMethod: 'multiple_voting',
        votingMaxVotesPerIdea: 2,
        votingMaxTotal: 5,
        votingMinTotal: 1,
      }).then((phase) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy
          .apiCreateIdea({
            phaseId: phase.body.data.id,
            ideaTitle,
            ideaContent,
          })
          .then((idea) => {
            ideaId = idea.body.data.id;
            ideaSlug = idea.body.data.attributes.slug;
            cy.apiSignup(firstName, lastName, email, password).then(
              (response) => {
                userId = (response as any).body.data.id;
              }
            );
            cy.setLoginCookie(email, password);
            cy.visit(`/en/projects/${projectSlug}`);

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
    cy.get('#e2e-ideas-container').should('be.visible');
    // it hides the idea sorting options
    cy.get('.e2e-filter-selector-button').should('not.exist');
  });

  it('can allocate the votes to ideas and show how many votes are left', () => {
    cy.contains('Cast your vote');
    cy.contains('How to vote');
    cy.dockProjectCtaBar();
    cy.dataCy('project-cta-bar-top').contains('5 out of 5 votes left');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('have.class', 'disabled');

    cy.get('#e2e-ideas-container')
      .find('.e2e-multiple-votes-button button')
      .should('be.visible')
      .click();

    cy.get('#e2e-ideas-container')
      .find('.e2e-multiple-votes-widget')
      .should('be.visible');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('not.have.class', 'disabled');

    cy.dataCy('project-cta-bar-top').contains('4 out of 5 votes left');

    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-plus button')
      .click()
      .should('have.class', 'disabled');
    cy.dataCy('project-cta-bar-top').contains('3 out of 5 votes left');

    cy.wait(1000);
  });

  it('can submit the votes', () => {
    cy.dockProjectCtaBar();
    // The vote count from the previous test proves the basket state has
    // loaded (a slow project → phase → basket fetch chain), without racing
    // a network intercept whose request may start later than the 5s
    // requestTimeout.
    cy.dataCy('project-cta-bar-top').contains('3 out of 5 votes left');
    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('not.have.class', 'disabled');

    // Wait for the submission to actually persist before the test ends —
    // the next test needs the basket in 'hasSubmitted' state on the backend.
    cy.intercept('PATCH', '**/baskets/**').as('submitBasket');
    cy.get('#e2e-voting-submit-button').find('button').click();
    cy.wait('@submitBasket')
      .its('response.statusCode')
      .should('be.oneOf', [200, 201]);

    cy.contains('Vote submitted');
    cy.contains('Congratulations, your vote has been submitted');

    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-minus button')
      .should('have.class', 'disabled');

    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-plus button')
      .should('have.class', 'disabled');
  });

  it('can modify and remove your votes', () => {
    cy.dockProjectCtaBar();
    // Longer timeout: the modify button renders only once the basket query
    // (end of the project → phase → basket chain) resolves as submitted.
    cy.get('#e2e-modify-votes', { timeout: 30000 })
      .should('be.visible')
      .should('contain', 'Modify your submission')
      .click();

    // Clicking "Modify your submission" reopens the basket via a mutation,
    // and the vote buttons stay disabled until it settles — a click in that
    // window is a silent no-op.
    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-minus button')
      .should('not.have.class', 'disabled')
      .click();

    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-plus button')
      .should('not.have.class', 'disabled');

    cy.dataCy('project-cta-bar-top').contains('4 out of 5 votes left');

    // Same guard: the previous vote mutation may briefly disable the button.
    cy.get('#e2e-ideas-container')
      .find('.e2e-vote-minus button')
      .should('not.have.class', 'disabled')
      .click();

    cy.dataCy('project-cta-bar-top').contains('5 out of 5 votes left');

    cy.get('#e2e-ideas-container')
      .find('.e2e-multiple-votes-button button')
      .should('be.visible');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('have.class', 'disabled');
  });

  // TODO: Check you cannot add more than the maximum number of votes?
});
