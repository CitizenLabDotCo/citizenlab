describe('Project selection page', () => {
  beforeEach(() => {
    cy.visit('/ideas/new');
    cy.acceptCookies();
  });

  it('shows the page', () => {
    cy.get('.e2e-project-selection-page');
  });

  it('shows a disabled continue button when no project selected', () => {
    cy.get('.e2e-submit-project-select-form').should('have.class', 'disabled');
  });

  it('shows an enabled continue button when a project is selected', () => {
    cy.get('.e2e-project-card.e2e-open-project').click();
    cy.get('.e2e-submit-project-select-form').should(
      'not.have.class',
      'disabled'
    );
  });

  it('cannot select a disabled project', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.e2e-project-card.disabled').length) {
        cy.get('.e2e-submit-project-select-form').should(
          'have.class',
          'disabled'
        );
      }
    });
  });

  it('navigates to the idea form when selecting a project and clicking continue', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.e2e-project-card.e2e-open-project.enabled').length) {
        cy.get('.e2e-project-card.e2e-open-project').click();
        cy.get('.e2e-submit-project-select-form').click();
        cy.url().should(
          'include',
          '/projects/an-idea-bring-it-to-your-council/ideas/new'
        );
        cy.get('#idea-form');
      }
    });
  });
});
