import { randomString } from '../support/commands';

describe('Continuous PB project', () => {
  before(() => {
    cy.visit('/projects/participatory-budgeting');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the PB expenses box', () => {
    cy.get('.e2e-pb-expenses-box');
  });

  it('shows the idea cards', () => {
    cy.get('#e2e-continuos-project-idea-cards');
  });

  it('shows the current sorting options', () => {
    cy.get('.e2e-filter-selector-button').first().click();
    cy.get('#e2e-item-random').should('exist');
    cy.get('#e2e-item-new').should('exist');
    cy.get('#e2e-item--new').should('exist');
    cy.get('#e2e-item-trending').should('not.exist');
    cy.get('#e2e-item-popular').should('not.exist');
  });
});

describe('Budgeting CTA bar', () => {
  let projectId: string;
  let projectSlug: string;
  const projectTitle = randomString();
  const description = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);
  let ideaId: string;

  before(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: description,
      description,
      publicationStatus: 'published',
      participationMethod: 'budgeting',
      maxBudget: 100,
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
      })
      .then(() => {
        return cy.apiCreateIdea(
          projectId,
          ideaTitle,
          ideaContent,
          undefined,
          undefined,
          undefined,
          21
        );
      })
      .then((idea) => {
        ideaId = idea.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
  });

  it('shows the CTA to the user to allocate their budget when the user has not yet participated and no CTA when they have particpated', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('[data-cy="budgeting-cta-button"]').should('exist');

    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .should('have.class', 'not-in-basket');
    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .click();
    cy.wait(2000);
    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .should('have.class', 'in-basket');

    cy.get('[data-cy="e2e-submit-my-basket-button"]').should('exist');
    cy.get('[data-cy="e2e-submit-my-basket-button"]').click({ force: true });

    cy.get('[data-cy="budgeting-cta-button"]').should('not.exist');

    cy.get('.e2e-assign-budget')
      .first()
      .find('.e2e-assign-budget-button')
      .click();
    cy.get('[data-cy="budgeting-cta-button"]').should('exist');
  });
});
