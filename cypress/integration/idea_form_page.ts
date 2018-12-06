describe('Idea form page', () => {
  beforeEach(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas/new')
      .get('.e2e-accept-cookies-btn').click();
  });

  it('shows the page', () => {
    cy.get('.e2e-idea-form-page');
  });

  it('shows the idea form', () => {
    cy.get('#idea-form');
  });

  it('has a working title field', () => {
    cy.get('#title').type('test').should('have.value', 'test');
  });

  it('has a working description field', () => {
    cy.get('.ql-editor').type('test').should('contain', 'test');
  });

  it('has a working topics select box', () => {
    cy.get('.e2e-idea-form-topics-multiple-select-box input').click({ force: true }).type('Education and youth{enter}', { force: true })
      .get('.e2e-idea-form-topics-multiple-select-box').contains('Education and youth');
  });

  it('has a working location field', () => {
    cy.get('.e2e-idea-form-location-input-field input').type('antwerp{enter}')
      .get('.e2e-idea-form-location-input-field #PlacesAutocomplete__autocomplete-container div').first().click()
      .get('.e2e-idea-form-location-input-field input').should('have.value', 'Antwerp, Belgium');
  });

  it('shows an error when no title is provided', () => {
    cy.get('.e2e-submit-idea-form').click()
      .get('.e2e-error-message').should('contain', 'Please provide a title');
  });

  it('shows an error when no description is provided', () => {
    cy.get('.e2e-submit-idea-form').click()
      .get('.e2e-error-message').should('contain', 'Please provide a description');
  });

  it('creates an idea when submitting the form with a title and description, and redirects to the sign-in form', () => {
    const ideaTtle = Math.random().toString(36).substr(2, 5).toLowerCase();
    const ideaDescription = Math.random().toString(36).substr(2, 5).toLowerCase();

    cy.get('#title').type(ideaTtle)
      .get('.ql-editor').type(ideaDescription)
      .get('.e2e-submit-idea-form').click()
      .get('.e2e-lazy-idea-flow-sign-in-form')
      .request({
        method: 'GET',
        url: `/web_api/v1/ideas/by_slug/${ideaTtle}`
      });
  });
});
