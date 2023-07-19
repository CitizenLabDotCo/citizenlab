import { apiAddComment, randomEmail, randomString } from '../support/commands';

describe('Continuous Voting / Budgeting project', () => {
  let projectId: string;
  let projectSlug: string;
  let ideaId: string;
  let ideaSlug: string;
  const projectTitle = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
      participationMethod: 'voting',
      votingMethod: 'budgeting',
      votingMaxTotal: 500,
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      return cy
        .apiCreateIdea(
          projectId,
          ideaTitle,
          ideaContent,
          undefined,
          undefined,
          undefined,
          100
        )
        .then((idea) => {
          ideaId = idea.body.data.id;
          ideaSlug = idea.body.data.attributes.slug;
          cy.apiSignup(firstName, lastName, email, password);
          cy.setLoginCookie(email, password);
          cy.visit(`/en/projects/${projectSlug}`);
          cy.acceptCookies();
          cy.wait(1000);
        });
    });
  });

  beforeEach(() => {
    cy.setLoginCookie(email, password);
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
  });

  it('shows the idea cards', () => {
    cy.get('#e2e-continuous-project-idea-cards');
  });

  it('hides the idea sorting options', () => {
    cy.get('.e2e-filter-selector-button').should('not.exist');
  });

  it('can allocate the budget to ideas and show how much budget is left', () => {
    cy.contains('Submit your budget');
    cy.contains('How to participate');
    cy.contains('500 / 500');

    cy.get('[data-cy="voting-submit-button"]')
      .should('exist')
      .should('have.class', 'disabled');

    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'not-in-basket')
      .click()
      .should('have.class', 'in-basket');
    cy.wait(2000);

    cy.get('[data-cy="voting-submit-button"]')
      .should('exist')
      .should('not.have.class', 'disabled');

    cy.contains('400 / 500');
  });

  it('can submit the budget', () => {
    cy.get('[data-cy="voting-submit-button"]').find('button').click();
    cy.wait(2000);

    cy.contains('Budget submitted');
    cy.contains('You have participated in this project');

    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'disabled');
  });

  it('can modify the budget and remove an option', () => {
    cy.get('#e2e-modify-votes')
      .should('exist')
      .should('contain', 'Modify your budget')
      .click();
    cy.wait(2000);

    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'in-basket')
      .click()
      .should('have.class', 'not-in-basket');

    cy.get('[data-cy="voting-submit-button"]')
      .should('exist')
      .should('have.class', 'disabled');
  });
});
