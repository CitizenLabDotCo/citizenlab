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
            projectId,
            ideaTitle,
            ideaContent,
            budget: 100,
            phaseIds: [phase.body.data.id],
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
    cy.contains('Submit your budget');
    cy.contains('How to participate');
    // EUR is the default currency in E2E seed data
    cy.contains('EUR 500 / EUR 500');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('have.class', 'disabled');

    cy.wait(2000);

    cy.intercept('PUT', '**/baskets/ideas/**').as('voteForIdea');

    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'not-in-basket')
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
    cy.get('#e2e-voting-submit-button').should('be.visible');
    cy.wait(4000);
    cy.get('#e2e-voting-submit-button').find('button').click({ force: true });
    cy.wait(1000);

    cy.contains('Budget submitted');
    cy.contains('You have participated in this project');

    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'disabled');
  });

  it('can modify the budget and remove an option', () => {
    cy.get('#e2e-modify-votes')
      .should('be.visible')
      .should('contain', 'Modify your submission');

    cy.wait(2000);

    cy.get('#e2e-modify-votes').click();

    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'in-basket');

    cy.wait(2000);

    cy.get('#e2e-ideas-container');

    cy.wait(1000);

    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .click()
      .should('have.class', 'not-in-basket');

    cy.get('#e2e-voting-submit-button')
      .should('be.visible')
      .should('have.class', 'disabled');
  });
});
