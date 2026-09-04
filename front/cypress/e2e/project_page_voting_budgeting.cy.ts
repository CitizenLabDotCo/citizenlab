import moment = require('moment');
import { randomEmail, randomString } from '../support/commands';

describe('Budgeting project', () => {
  let projectId: string;
  let projectSlug: string;
  let ideaId: string;
  let userId: string;
  const projectTitle = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const phaseTitle = randomString();

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: '',
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: phaseTitle,
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'voting',
          votingMethod: 'budgeting',
          votingMaxTotal: 500,
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        cy.apiCreateEvent({
          projectId,
          title: 'Event title',
          location: 'Event location',
          includeLocation: true,
          description: 'Event description',
          startDate: moment().subtract(1, 'day').toDate(),
          endDate: moment().add(1, 'day').toDate(),
        });
        return cy
          .apiCreateIdea({
            phaseId: phase.body.data.id,
            ideaTitle,
            ideaContent,
            budget: 100,
          })
          .then((idea) => {
            ideaId = idea.body.data.id;
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

  beforeEach(() => {
    cy.setLoginCookie(email, password);
    cy.visit(`/en/projects/${projectSlug}`);
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  it('shows the idea cards, sorting options and event CTA', () => {
    cy.get('.e2e-timeline-project-idea-cards');
    cy.get('.e2e-filter-selector-button').should('not.exist');
    cy.get('#e2e-project-see-events-button').should('be.visible');
  });

  it('can allocate the budget to ideas and show how much budget is left', () => {
    cy.dockProjectCtaBar();
    cy.contains('Submit your budget');
    cy.contains('How to participate');
    // EUR is the default currency in E2E seed data
    cy.contains('EUR 500 / EUR 500');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('have.class', 'disabled');

    cy.wait(2000);

    cy.intercept('PUT', '**/baskets/ideas/**').as('voteForIdea');

    // The vote buttons can carry the `disabled` class while the voting
    // context initializes — a click during that window is a silent no-op,
    // so gate on the enabled state before clicking.
    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'not-in-basket')
      .should('not.have.class', 'disabled')
      .click()
      .should('have.class', 'in-basket');

    cy.wait('@voteForIdea');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('not.have.class', 'disabled');

    // EUR is the default currency in E2E seed data
    cy.contains('EUR 400 / EUR 500');
  });

  it('can submit the budget', () => {
    cy.dockProjectCtaBar();
    cy.intercept('PATCH', '**/baskets/*').as('submitBasket');
    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .click({ force: true });
    cy.wait('@submitBasket');

    cy.contains('Budget submitted');
    cy.scrollTo('bottom');
    cy.contains('You have participated in this project');

    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'disabled');
  });

  it('can modify the budget and remove an option', () => {
    cy.dockProjectCtaBar();

    cy.intercept('PATCH', '**/baskets/*').as('unsubmitBasket');
    // Keep the assertions and the click in one query chain: late-loading
    // content (map config, randomly sorted idea cards) re-renders the page
    // and can detach the button — a chained query re-runs from the start,
    // while a fresh cy.get after a blind wait finds nothing and fails.
    cy.get('#e2e-modify-votes')
      .should('be.visible')
      .should('contain', 'Modify your submission')
      .click();
    cy.wait('@unsubmitBasket');

    // After the unsubmit lands, the vote buttons keep the `disabled` class
    // until the basket refetches complete; `in-basket` alone is true during
    // that window and a click on the still-disabled button is a silent
    // no-op. Gate on the enabled state before clicking.
    cy.intercept('PUT', '**/baskets/ideas/**').as('removeVote');
    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'in-basket')
      .should('not.have.class', 'disabled')
      .click()
      .should('have.class', 'not-in-basket');
    cy.wait('@removeVote');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('have.class', 'disabled');
  });
});
