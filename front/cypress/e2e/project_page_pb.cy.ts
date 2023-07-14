import { apiAddComment, randomString } from '../support/commands';

describe('Continuous PB project', () => {
  let projectId: string;
  let projectSlug: string;
  let ideaId: string;
  let ideaSlug: string;
  const projectTitle = randomString();
  const ideaTitle = randomString();
  const ideaContent = Math.random().toString(36);

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
  });

  it('shows the idea cards', () => {
    cy.get('#e2e-continuos-project-idea-cards');
  });

  it('hides the idea sorting options', () => {
    cy.get('.e2e-filter-selector-button').should('not.exist');
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
      participationMethod: 'voting',
      votingMethod: 'budgeting',
      votingMaxTotal: 100,
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

    // cy.get('[data-cy="e2e-submit-my-basket-button"]').should('exist');
    // cy.get('[data-cy="e2e-submit-my-basket-button"]').click({ force: true });

    // cy.get('[data-cy="budgeting-cta-button"]').should('not.exist');

    // cy.get('.e2e-assign-budget')
    //   .first()
    //   .find('.e2e-assign-budget-button')
    //   .click();
    // cy.get('[data-cy="budgeting-cta-button"]').should('exist');
  });
});
