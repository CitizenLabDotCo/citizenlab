/// <reference types="cypress"/>

const loginAsAdmin = () => {
  cy.visit('/sign-in');
  cy.get('#email').type('koen@citizenlab.co');
  cy.get('#password').type('testtest');
  cy.get('.e2e-submit-signin').click();
};

const logOut = () => {
  cy.get('#e2e-user-menu-container').click().get('#e2e-sign-out-link').click();
};

const createNewProject = (projectName: string) => {
  cy.visit('/admin/projects');
  cy.get('.e2e-admin-add-project').click();
  cy.get('#project-title-en').type(projectName);
  cy.get('#project-title-nl-BE').type(projectName);
  cy.get('.e2e-submit-wrapper-button').click();
};

// describe('Home page', () => {
//   it('successfully loads', () => {
//     cy.visit('/');
//     cy.get('#e2e-landing-page');
//   });
// });

// describe('Sign in page', () => {
//   it('signs in for valid credentials and redirects to the homepage', () => {
//     cy.visit('/sign-in');
//     cy.get('#email').type('koen@citizenlab.co');
//     cy.get('#password').type('testtest');
//     cy.get('.e2e-submit-signin').click();
//     cy.location('pathname').should('eq', '/en/');
//     cy.getCookie('cl2_jwt').should('exist');
//     cy.get('#e2e-user-menu-container').should('contain', 'Koen');
//   });

//   it('shows an error message when trying to sign in with invalid credentials', () => {
//     cy.visit('/sign-in');
//     cy.get('#email').type('dsfdetrtertfdss@dfdsf.co');
//     cy.get('#password').type('fdfwerwerdgdfgdfgfdg');
//     cy.get('.e2e-submit-signin').click();
//     cy.get('.e2e-error-message').contains('This combination of e-mail and password is not correct');
//   });
// });

// describe('Sign up page', () => {
//   it('signs up a new user and redirects him to the homepage', () => {
//     const firstName = Math.random().toString(36).substr(2, 5);
//     const lastName = Math.random().toString(36).substr(2, 5);
//     const email = `${Math.random().toString(36).substr(2, 5)}@citizenlab.co`;
//     const password = '123456789';

//     cy.visit('/sign-up');
//     cy.get('#firstName').type(firstName);
//     cy.get('#lastName').type(lastName);
//     cy.get('#email').type(email);
//     cy.get('#password').type(password);
//     cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
//     cy.get('#e2e-signup-step1-button').click();
//     cy.get('.e2e-signup-step2-button').click();
//     cy.location('pathname').should('eq', '/en/');
//     cy.getCookie('cl2_jwt').should('exist');
//     cy.get('#e2e-user-menu-container').should('contain', firstName);
//   });
// });

describe('Admin > projects', () => {
  it('saves and idea, signs you in, publishes the idea and redirects you to the idea page', () => {
    const projectName = Math.random().toString(36).substr(2, 5);
    loginAsAdmin();
    createNewProject(projectName);
    logOut();
    cy.get('.addIdea').click();
    cy.location('pathname').should('eq', '/en/ideas/new');
    cy.visit('/admin/projects');
    cy.get('.e2e-admin-add-project').click();
    cy.get('#project-title-en').type('e2e test project');
    cy.get('#project-title-nl-BE').type('e2e test project');
    cy.get('.e2e-submit-wrapper-button').click();
  });
});

describe('Lazy idea posting flow', () => {
  // beforeEach(() => {
  //   cy.visit('/sign-in');
  //   cy.get('#email').type('koen@citizenlab.co');
  //   cy.get('#password').type('testtest');
  //   cy.get('.e2e-submit-signin').click();
  // });

  it('saves and idea, signs you in, publishes the idea and redirects you to the idea page', () => {
    cy.visit('/sign-up');
    cy.get('#firstName').type(firstName);
    cy.get('#lastName').type(lastName);
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('.e2e-terms-and-conditions .e2e-checkbox').click();
    cy.get('#e2e-signup-step1-button').click();
    cy.get('.e2e-signup-step2-button').click();
    cy.location('pathname').should('eq', '/en/');
    cy.getCookie('cl2_jwt').should('exist');
    cy.get('#e2e-user-menu-container').should('contain', firstName);
  });
});
