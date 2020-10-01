import { randomString } from '../support/commands';

describe('Continuous project with ideation', () => {
  before(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the project header', () => {
    cy.get('#e2e-project-header-image');
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-startdate');
    cy.get('#e2e-project-sidebar-participantcount');
    cy.get('#e2e-project-sidebar-ideacount');
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
});

describe('Continuous project with participatory budgeting', () => {
  before(() => {
    cy.visit('/projects/participatory-budgeting');
    cy.get('#e2e-project-page');
    cy.wait(1000);
  });

  it('shows the project header', () => {
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

  it('shows the project header', () => {
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

  it('shows the project header', () => {
    cy.get('#e2e-project-description');
    cy.get('#e2e-project-sidebar');
    cy.get('#e2e-project-sidebar-startdate');
    cy.get('#e2e-project-sidebar-share-button');
  });

  it('shows the poll', () => {
    cy.get('#e2e-continuous-project-survey-container');
  });
});
