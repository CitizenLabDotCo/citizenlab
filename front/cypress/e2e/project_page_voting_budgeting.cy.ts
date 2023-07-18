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
      votingMaxTotal: 1000,
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
          300
        )
        .then((idea) => {
          ideaId = idea.body.data.id;
          ideaSlug = idea.body.data.attributes.slug;
          cy.visit(`/en/projects/${projectSlug}`);
          cy.get('#e2e-project-page');
          cy.wait(1000);
        });
    });
    cy.apiSignup(firstName, lastName, email, password);
    cy.acceptCookies();
    cy.setLoginCookie(email, password);
    cy.reload();
  });

  after(() => {
    cy.apiRemoveIdea(ideaId);
    cy.apiRemoveProject(projectId);
  });

  it('shows the idea cards', () => {
    cy.visit(`/en/projects/${projectSlug}`);
    cy.get('#e2e-continuos-project-idea-cards');
  });

  it('hides the idea sorting options', () => {
    cy.get('.e2e-filter-selector-button').should('not.exist');
  });

  it('can allocate the budget to ideas', () => {
    cy.get('[data-cy="budgeting-cta-button"]')
      .should('exist')
      .should('have.class', 'disabled');
    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'not-in-basket');
    cy.get('#e2e-ideas-container').find('.e2e-assign-budget-button').click();
    cy.wait(2000);
    cy.get('#e2e-ideas-container')
      .find('.e2e-assign-budget-button')
      .should('have.class', 'in-basket');
    cy.get('[data-cy="budgeting-cta-button"]')
      .should('exist')
      .should('not.have.class', 'disabled');
  });

  it('can submit the budget', () => {
    cy.get('[data-cy="budgeting-cta-button"]').click({ force: true });
    cy.wait(2000);
    // cy.get('[data-cy="budgeting-cta-button"]')
    //   .should('not.exist')
    cy.get('#e2e-voting-status').should('exist');
    // .should('contain', 'Budget submitted');
    cy.get('#e2e-modify-votes').should('exist');
    // .should('contain', 'Modify your budget');
  });

  it('can modify the budget', () => {
    cy.get('#e2e-modify-votes').find('button').click({ force: true });
  });
});
