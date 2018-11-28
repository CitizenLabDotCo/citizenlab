import * as Cookies from 'js-cookie';

describe('Project selection page', () => {
  // const projectTitle = Math.random().toString(36).substr(2, 5).toLowerCase();
  // const projectDescription = Math.random().toString(36).substr(2, 5).toLowerCase();

  // before(() => {
  //   cy.loginAsAdmin();
  //   cy.wait(1000);
  //   const jwt = Cookies.get('cl2_jwt');
  //   console.log('zolg');
  //   console.log(jwt);
  //   cy.request({
  //     method: 'POST',
  //     url: '/web_api/v1/projects',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${jwt}`
  //     },
  //     body: {
  //       project: {
  //         commenting_enabled: true,
  //         participation_method: 'ideation',
  //         posting_enabled: true,
  //         presentation_mode: 'card',
  //         process_type: 'continuous',
  //         voting_enabled: true,
  //         voting_method: 'unlimited',
  //         title_multiloc: {
  //           en: projectTitle
  //         }
  //       }
  //     }
  //   });
  // });

  beforeEach(() => {
    cy.visit('/ideas/new');
    cy.get('.e2e-accept-cookies-btn').click();
  });

  it('shows the page', () => {
    cy.get('.e2e-project-selection-page');
  });

  it('shows a disabled continue button when no project selected', () => {
    cy.get('.e2e-submit-project-select-form').should('have.class', 'disabled');
  });

  it('shows an enabled continue button when a project is selected', () => {
    cy.contains('An idea? Bring it to your council!').click();
    cy.get('.e2e-submit-project-select-form').should('not.have.class', 'disabled');
  });

  it('navigates to the idea form on submit', () => {
    // the preparation
    const projectName = Math.random().toString(36).substr(2, 5).toLowerCase();
    cy.loginAsAdmin();
    cy.visit('/admin/projects');
    cy.get('.e2e-admin-add-project').click();
    // cy.get('#projecstatus-archived').click();
    cy.get('#project-title-en').type(projectName);
    cy.get('#project-title-nl-BE').type(projectName);
    cy.get('.e2e-project-type-continuous').click();
    cy.get('.e2e-submit-wrapper-button').click();

    // the actual test
    cy.visit('/ideas/new');
    cy.contains(projectName).click();
    cy.get('.e2e-submit-project-select-form').click();
    cy.location('pathname').should('eq', `/en/projects/${projectName}/ideas/new`);
    cy.get('#idea-form');
  });
});
