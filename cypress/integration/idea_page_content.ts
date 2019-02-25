describe('Idea Content', () => {

  beforeEach(() => {
    cy.visit('/ideas/controversial-idea');
    cy.acceptCookies();
  });

  it('shows the page', () => {
    cy.get('#e2e-idea-show');
  });

  it('shows where you are', () => {
    cy.get('.e2e-project-link').should('be.visible');
  });

  it('shows the idea Title', () => {
    cy.get('.e2e-ideatitle');
  });

  it('shows the idea Image', () => {
    cy.get('.e2e-ideaImage');
  });

  it('shows idea body', () => {
    cy.get('#e2e-idea-show').contains('With a lot of comments');
  });

  it('shows a link to author profile', () => {
    cy.get('.e2e-author-link').click();
    cy.location('pathname').should('eq', '/en-GB/profile/casey-luettgen');
  });

  it('shows the comments content correctly', () => {
    cy.get('.e2e-comments-container').contains('Great idea, we stand behind you! I\'ll come riding a bicycle');
    cy.get('.e2e-comments-container').contains('I\'ve never seen you riding a bicycle..');
    cy.get('.e2e-comments-container').contains('No no no no no');
  });
});
