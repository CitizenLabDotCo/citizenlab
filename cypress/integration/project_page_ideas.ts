import { randomString } from '../support/commands';

describe('Continuous ideation project', () => {
  before(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-startdate');
    cy.get('#e2e-project-sidebar-participants-count');
    cy.get('#e2e-project-sidebar-ideas-count');
    cy.get('#e2e-project-sidebar-share-button');
    cy.get('#e2e-project-see-ideas-button');
    cy.get('#project-ideabutton');
    cy.get('#e2e-project-description-read-more-button');
  });

  it('shows the post-your-idea button', () => {
    cy.get('#project-ideabutton');
  });

  it('shows the idea cards', () => {
    cy.get('#e2e-continuos-project-idea-cards');
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card');
  });

  it('asks unauthorised users to log in or sign up before they vote', () => {
    cy.get('#e2e-ideas-container')
      .find('.e2e-idea-card')
      .first()
      .find('.upvote.enabled')
      .click();
    cy.get('#e2e-sign-up-in-modal');
    cy.get('.e2e-modal-close-button').click();
  });

  it('takes you to the idea page when clicking an idea card', () => {
    cy.get('#e2e-ideas-container')
      .find('.e2e-idea-card')
      .first()
      .as('ideaCard');
    cy.get('@ideaCard').then(($a) => {
      const href = $a.prop('href');
      cy.get('@ideaCard').click();
      cy.url().should('eq', href);
    });
  });
});

describe('Timeline ideation project', () => {
  before(() => {
    cy.visit('/projects/timeline-ideation-card');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-startdate-enddate');
    cy.get('#e2e-project-sidebar-participants-count');
    cy.get('#e2e-project-sidebar-phases-count');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the idea cards', () => {
    cy.get('.e2e-timeline-project-idea-cards');
    cy.get('#e2e-ideas-list');
    cy.get('.e2e-idea-card');
  });
});
