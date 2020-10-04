import { randomString } from '../support/commands';

describe('Continuous project with ideation', () => {
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

describe('Continuous project with participatory budgeting', () => {
  before(() => {
    cy.visit('/projects/participatory-budgeting');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-startdate');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the PB expenses box', () => {
    cy.get('.e2e-pb-expenses-box');
  });

  it('shows the idea cards', () => {
    cy.get('#e2e-continuos-project-idea-cards');
  });
});

describe('Continuous project with poll', () => {
  before(() => {
    cy.visit('/projects/the-big-poll');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-startdate');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the poll', () => {
    cy.get('#e2e-continuous-project-poll-container');
  });
});

describe('Continuous project with survey', () => {
  before(() => {
    cy.setAdminLoginCookie();
    cy.visit('/projects/charlie-crew-survey');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-startdate');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the poll', () => {
    cy.get('#e2e-continuous-project-survey-container');
  });
});

describe('Timeline project with active ideation phase', () => {
  before(() => {
    cy.visit('/projects/test-project-1-timeline-with-file');
    cy.get('#e2e-project-page');
    cy.acceptCookies();
    cy.wait(1000);
  });

  it('shows the correct project header', () => {
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-startdate-enddate');
    cy.get('#e2e-project-sidebar-phases-count');
    cy.get('#e2e-project-sidebar-participants-count');
    cy.get('#e2e-project-sidebar-share-button');
    cy.get('#e2e-project-see-ideas-button');
    cy.get('#project-ideabutton');
    cy.get('#e2e-project-description')
      .contains('20190110_rueil_intermediaire.pdf')
      .should('have.attr', 'href');
  });

  it('shows the timeline', () => {
    cy.get('#project-timeline');
  });

  it('shows the timeline phases', () => {
    cy.get('.e2e-phases');
  });

  it('shows the phase navigation buttons', () => {
    cy.get('.e2e-timeline-phase-navigation');
  });

  it('has a selected phase', () => {
    cy.get('.e2e-phases .selectedPhase');
  });

  it('shows the phase title', () => {
    cy.get('.e2e-phase-title');
  });

  it('shows the phase description', () => {
    cy.get('.e2e-phase-description');
  });

  it('shows the idea cards', () => {
    cy.get('.e2e-timeline-project-idea-cards');
  });
});
