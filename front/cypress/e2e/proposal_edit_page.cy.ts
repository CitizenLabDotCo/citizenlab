// import { randomString, randomEmail } from '../support/commands';

// describe('Initiative form page', () => {
//   const firstName = randomString();
//   const lastName = randomString();
//   const email = randomEmail();
//   const password = randomString();
//   const initiativeTitle = randomString(40);
//   const initiativeContent = randomString(60);
//   const newInitiativeTitle = randomString(40);
//   const newInitiativeContent = randomString(60);
//   let jwt: string;
//   let initiativeId: string;

//   before(() => {
//     cy.apiSignup(firstName, lastName, email, password);
//     cy.apiLogin(email, password)
//       .then((user) => {
//         jwt = user.body.jwt;
//         return cy.apiCreateInitiative({
//           initiativeTitle,
//           initiativeContent,
//           jwt,
//         });
//       })
//       .then((initiative) => {
//         initiativeId = initiative.body.data.id;
//       });
//   });

//   beforeEach(() => {
//     cy.setLoginCookie(email, password);
//     cy.visit(`/initiatives/edit/${initiativeId}`);
//     cy.acceptCookies();
//     cy.get('.e2e-initiative-edit-page');
//   });

//   it('has a working initiative edit form', () => {
//     cy.get('#initiative-form');
//     cy.get('#e2e-initiative-title-input').as('titleInput');
//     cy.get('#e2e-initiative-form-description-section .ql-editor').as(
//       'descriptionInput'
//     );

//     // check initial values
//     cy.get('@titleInput').should('have.value', initiativeTitle);
//     cy.get('@descriptionInput').contains(initiativeContent);

//     // edit title and description
//     cy.get('@titleInput').clear().type(newInitiativeTitle);
//     cy.get('@descriptionInput').clear().type(newInitiativeContent);

//     // verify the new values
//     cy.get('@titleInput').should('have.value', newInitiativeTitle);
//     cy.get('@descriptionInput').contains(newInitiativeContent);

//     // add a topic
//     cy.get('.e2e-topics-picker').find('button').eq(3).click();

//     // verify that the topic has been selected
//     cy.get('.e2e-topics-picker')
//       .find('button.selected')
//       .should('have.length', 1);

//     // save the form
//     cy.get('.e2e-initiative-publish-button').find('.e2e-submit-form').click();

//     // verify redirect to the initiative page
//     cy.location('pathname').should(
//       'eq',
//       `/en/initiatives/${initiativeTitle}`
//     );

//     // verify the content on the initiative page
//     cy.get('#e2e-initiative-title').contains(newInitiativeTitle);
//     cy.get('#e2e-initiative-description').contains(newInitiativeContent);
//   });

//   after(() => {
//     cy.apiRemoveInitiative(initiativeId);
//   });
// });
